import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular';
import { SiteHeaderComponent } from './site-header.component';
import { SupabaseService } from './services/supabase.service';
import { ApiService } from './services/api.service';
import { UserProfileService } from './services/user-profile.service';
import { Order } from './shop.service';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.scss'],
  imports: [SiteHeaderComponent, CurrencyPipe, DatePipe, RouterLink, IonButton, IonContent],
})
export class OrdersPageComponent {
  readonly auth = inject(UserProfileService);
  private readonly supabase = inject(SupabaseService);
  private readonly api = inject(ApiService);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  ionViewWillEnter(): void {
    void this.load();
  }

  ionViewDidLeave(): void {
    this.orders.set([]);
  }

  async load(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.orders.set([]);

    try {
      await this.auth.restore();
      const user = this.auth.profile();
      if (!user) return;

      if (this.supabase.isConfigured) {
        const { data, error } = await this.supabase.client
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        const mapped: Order[] = (data || []).map((row: any) => ({
          id: row.order_code,
          currency: 'PHP',
          total: Number(row.total_amount),
          status: row.status,
          createdAt: row.created_at,
          address: row.address,
          payment: row.payment_method,
          paymentReference: row.payment_reference || undefined,
          paymentStatus: row.payment_status || undefined,
          items: (row.order_items || []).map((item: any) => ({
            name: item.product_name,
            qty: item.quantity,
            price: Number(item.unit_price),
          })),
        }));

        if (this.auth.profile()?.id === user.id) {
          this.orders.set(mapped);
        }
      } else {
        const { orders } = await this.api.request<{ orders: Order[] }>('/orders');
        if (
          !Array.isArray(orders) ||
          orders.some(order => order.currency !== 'PHP' || !Number.isFinite(order.total) || order.total < 0 || !Array.isArray(order.items))
        ) {
          throw new Error('Unable to load your orders. Please try again.');
        }
        if (this.auth.profile()?.id === user.id) this.orders.set(orders);
      }
    } catch (error) {
      this.error.set((error as Error).message);
    } finally {
      this.loading.set(false);
    }
  }
}
