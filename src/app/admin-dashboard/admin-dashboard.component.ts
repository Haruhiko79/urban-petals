import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../site-header.component';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SiteHeaderComponent, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  delivered = signal(0);
  transit = signal(0);
  pending = signal(0);
  cancelled = signal(0);
  revenue = signal(0);

  async ngOnInit(): Promise<void> {
    if (!this.supabase.isConfigured) {
      return;
    }
    try {
      const { data: orders } = await this.supabase.client.from('orders').select('*');
      if (orders) {
        const arr: any[] = orders as any[];
        this.delivered.set(arr.filter((o: any) => o.status === 'delivered').length);
        this.transit.set(arr.filter((o: any) => o.status === 'in-transit').length);
        this.pending.set(arr.filter((o: any) => o.status === 'pending').length);
        this.cancelled.set(arr.filter((o: any) => o.status === 'cancelled' || o.status === 'rejected').length);
        this.revenue.set(arr.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0));
      }
    } catch (e) {}
  }
}

