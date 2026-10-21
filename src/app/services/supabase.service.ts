import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  readonly client: SupabaseClient;
  readonly isConfigured = Boolean(environment.supabaseUrl && environment.supabaseAnonKey);
  readonly currentUser = signal<User | null>(null);
  readonly currentSession = signal<Session | null>(null);

  constructor() {
    const url = (environment.supabaseUrl || '')
      .trim()
      .replace(/\/rest\/v1\/?$/, '')
      .replace(/\/+$/, '');

    this.client = createClient(
      url || 'https://placeholder.supabase.co',
      environment.supabaseAnonKey || 'placeholder-key',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );

    if (this.isConfigured) {
      this.client.auth.getSession().then(({ data }) => {
        this.currentSession.set(data.session);
        this.currentUser.set(data.session?.user ?? null);
      });

      this.client.auth.onAuthStateChange((_event, session) => {
        this.currentSession.set(session);
        this.currentUser.set(session?.user ?? null);
      });
    }
  }
}

