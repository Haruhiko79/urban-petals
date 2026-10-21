import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../site-header.component';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-admin-accounts',
  standalone: true,
  imports: [CommonModule, SiteHeaderComponent, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, RouterLink],
  templateUrl: './admin-accounts.component.html',
  styleUrls: ['./accounts.css']
})
export class AdminAccountsComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  users = signal<any[]>([]);

  async ngOnInit(): Promise<void> {
    if (!this.supabase.isConfigured) return;
    try {
      const { data } = await this.supabase.client.from('users').select('*').order('id', { ascending: true });
      this.users.set(data || []);
    } catch (e) {}
  }
}

