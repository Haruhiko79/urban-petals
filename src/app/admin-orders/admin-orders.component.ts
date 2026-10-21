import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../site-header.component';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, SiteHeaderComponent, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, RouterLink],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./orders.css']
})
export class AdminOrdersComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  orders = signal<any[]>([]);

  async ngOnInit(): Promise<void> {
    if (!this.supabase.isConfigured) return;
    try {
      const { data } = await this.supabase.client.from('orders').select('*').order('id', { ascending: false });
      this.orders.set(data || []);
    } catch (e) {}
  }
}

