import { computed, inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ApiService } from './api.service';

export interface UserProfile {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  imageUrl: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly supabase = inject(SupabaseService);
  private readonly api = inject(ApiService);
  private readonly profileState = signal<UserProfile | null>(null);
  private readonly profileErrorState = signal('');

  readonly profileError = computed(() => (this.supabase.isConfigured ? this.profileErrorState() : ''));

  readonly profile = computed(() => (this.supabase.isConfigured ? this.profileState() : this.api.token() ? this.profileState() : null));

  constructor() {
    if (this.supabase.isConfigured) {
      this.supabase.client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          this.api.setToken(session.access_token);
          await this.fetchProfile(session.user.id, session.user.email ?? '');
        } else if (event === 'SIGNED_OUT') {
          this.api.setToken('');
          this.profileState.set(null);
        }
      });
    }
  }

  async restore(): Promise<void> {
    if (this.supabase.isConfigured) {
      try {
        const { data: { session } } = await this.supabase.client.auth.getSession();
        if (!session?.user) {
          this.profileState.set(null);
          return;
        }
        this.api.setToken(session.access_token);
        await this.fetchProfile(session.user.id, session.user.email ?? '');
      } catch {
        this.profileState.set(null);
      }
    } else {
      const token = this.api.token();
      if (!token) return;
      const { user } = await this.api.request<{ user: UserProfile }>('/auth/me');
      if (this.api.token() === token) this.profileState.set(user);
    }
  }

  async authenticate(
    mode: 'register' | 'login',
    details: { name?: string; phone?: string; email: string; password: string }
  ): Promise<'signed-in' | 'pending-verification'> {
    if (this.supabase.isConfigured) {
      if (mode === 'register') {
        const name = details.name?.trim() || '';
        const firstName = name.split(' ')[0] || '';
        const lastName = name.substring(firstName.length).trim();

        const { data, error } = await this.supabase.client.auth.signUp({
          email: details.email.trim(),
          password: details.password,
          options: {
            data: {
              name: details.name?.trim(),
              first_name: firstName,
              last_name: lastName,
              phone: details.phone?.trim(),
            },
          },
        });

        if (error) throw new Error(error.message);
        if (!data.user) throw new Error('Registration failed. Please try again.');

        if (data.session) {
          this.api.setToken(data.session.access_token);
          await this.fetchProfile(data.user.id, data.user.email ?? '');
          return 'signed-in';
        }
        return 'pending-verification';
      } else {
        const { data, error } = await this.supabase.client.auth.signInWithPassword({
          email: details.email.trim(),
          password: details.password,
        });

        if (error) throw new Error(error.message);
        if (!data.user || !data.session) throw new Error('Login failed. Please check your credentials.');

        this.api.setToken(data.session.access_token);
        await this.fetchProfile(data.user.id, data.user.email ?? '');
        return 'signed-in';
      }
    } else {
      const result = await this.api.request<{ user: UserProfile; token: string }>(`/auth/${mode}`, 'POST', details);
      this.api.setToken(result.token);
      this.profileState.set(result.user);
      return 'signed-in';
    }
  }

  async resendVerification(email: string): Promise<void> {
    if (!this.supabase.isConfigured) return;
    const { error } = await this.supabase.client.auth.resend({ type: 'signup', email: email.trim() });
    if (error) throw new Error(error.message);
  }

  async setSession(accessToken: string, refreshToken: string): Promise<void> {
    if (!this.supabase.isConfigured) return;
    const { error } = await this.supabase.client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) throw new Error(error.message);
  }

  async exchangeCodeForSession(code: string): Promise<{ error: Error | null }> {
    if (!this.supabase.isConfigured) return { error: null };
    const { error } = await this.supabase.client.auth.exchangeCodeForSession(code);
    return { error: error ? new Error(error.message) : null };
  }

  async save(details: Pick<UserProfile, 'name' | 'phone' | 'imageUrl'>): Promise<void> {
    if (this.supabase.isConfigured) {
      const current = this.profileState();
      if (!current) return;

      const firstName = details.name.split(' ')[0] || '';
      const lastName = details.name.substring(firstName.length).trim();

      const { error } = await this.supabase.client
        .from('users')
        .upsert(
          {
            id: current.id,
            email: current.email,
            first_name: firstName,
            last_name: lastName,
            phone: details.phone,
            avatar: details.imageUrl,
            role: current.role ?? 'customer',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select('id')
        .maybeSingle();

      if (error) {
        this.profileErrorState.set(`Could not save your profile: ${error.message}`);
        throw new Error(error.message);
      }
      this.profileErrorState.set('');

      this.profileState.set({
        ...current,
        name: details.name,
        phone: details.phone,
        imageUrl: details.imageUrl,
      });
    } else {
      const { user } = await this.api.request<{ user: UserProfile }>('/profile', 'PATCH', details);
      this.profileState.set(user);
    }
  }

  async signOut(): Promise<void> {
    if (this.supabase.isConfigured) {
      await this.supabase.client.auth.signOut();
    } else {
      await this.api.request('/auth/logout', 'POST');
    }
    this.api.setToken('');
    this.profileState.set(null);
  }

  private async fetchProfile(userId: string, email: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile from users table:', error.message);
        this.profileErrorState.set(`Could not load your profile from the database: ${error.message}`);
      }

      if (!data && !error) {
        console.warn('No users row found for', userId, '- profile edits may not persist. Run Supabase_profile_policies.sql (backfill + RLS) in the SQL Editor.');
        this.profileErrorState.set('No profile record exists in the database yet. Saving your profile will create it.');
      } else if (data && !error) {
        this.profileErrorState.set('');
      }

      const fullName = data
        ? `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email || email
        : email;

      this.profileState.set({
        id: userId,
        name: fullName,
        email: data?.email || email,
        phone: data?.phone || '',
        imageUrl: data?.avatar || '',
        role: data?.role || 'customer',
      });
    } catch (error) {
      console.warn('Failed to fetch profile from users table:', error);
      this.profileErrorState.set('Could not load your profile from the database. Your details will not persist until this is fixed.');
      this.profileState.set({
        id: userId,
        name: email,
        email: email,
        phone: '',
        imageUrl: '',
        role: 'customer',
      });
    }
  }
}
