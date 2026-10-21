import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../site-header.component';
import { SupabaseService } from '../services/supabase.service';
import { UserProfileService } from '../services/user-profile.service';

@Component({
  selector: 'app-admin-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, SiteHeaderComponent, IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar, RouterLink],
  templateUrl: './admin-accounts.component.html',
  styleUrls: ['./accounts.css', '../admin-shared.css']
})
export class AdminAccountsComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(UserProfileService);
  readonly roles = ['customer', 'admin', 'super_admin'];
  readonly statuses = ['online', 'offline'];
  users = signal<any[]>([]);
  search = signal('');
  busyId: string | null = null;
  error = '';
  message = '';

  currentId(): string | null {
    const id = this.auth.profile()?.id;
    return id === undefined || id === null ? null : String(id);
  }

  visibleUsers = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.users();
    return this.users().filter((user: any) =>
      [user.first_name, user.last_name, user.email, user.role, user.department, user.employee_id, user.status]
        .some((value: any) => String(value ?? '').toLowerCase().includes(term))
    );
  });

  fullName(user: any): string {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unnamed account';
  }

  isOwn(user: any): boolean {
    return this.currentId() === String(user.id);
  }

  async ngOnInit(): Promise<void> {
    await this.load();
    if (!this.currentId()) await this.auth.restore().catch(() => undefined);
  }

  async load(): Promise<void> {
    if (!this.supabase.isConfigured) return;
    this.error = '';
    try {
      const { data, error } = await this.supabase.client
        .from('users')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      this.users.set(data || []);
    } catch (e) {
      this.error = (e as Error).message;
    }
  }

  async save(user: any): Promise<void> {
    if (this.busyId || this.isOwn(user)) return;
    this.busyId = user.id;
    this.error = this.message = '';
    try {
      const { error } = await this.supabase.client
        .from('users')
        .update({
          role: user.role,
          status: user.status,
          department: user.department ?? null,
          employee_id: user.employee_id ?? null,
        })
        .eq('id', user.id);
      if (error) throw new Error(error.message);
      this.message = `${this.fullName(user)} — role ${user.role}, status ${user.status}.`;
    } catch (e) {
      this.error = `Could not update ${this.fullName(user)}: ${(e as Error).message}`;
      await this.load();
    } finally {
      this.busyId = null;
    }
  }
}
