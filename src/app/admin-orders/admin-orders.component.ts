import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../site-header.component';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, SiteHeaderComponent, IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar, RouterLink],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./orders.css', '../admin-shared.css']
})
export class AdminOrdersComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  readonly statuses = ['pending', 'in-transit', 'delivered', 'cancelled'];
  orders = signal<any[]>([]);
  search = signal('');
  error = '';
  message = '';
  busyId: number | null = null;

  visibleOrders = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.orders();
    return this.orders().filter((order: any) =>
      [order.order_code, order.customer_name, order.contact_number, order.status, order.payment_method, order.payment_reference]
        .some((value: any) => String(value ?? '').toLowerCase().includes(term))
    );
  });

  itemsOf(order: any): { product_name: string; quantity: number; unit_price: number }[] {
    return Array.isArray(order.order_items) ? order.order_items : [];
  }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.supabase.isConfigured) return;
    this.error = '';
    try {
      const { data, error } = await this.supabase.client
        .from('orders')
        .select('*, order_items(*)')
        .order('id', { ascending: false });
      if (error) throw new Error(error.message);
      this.orders.set(data || []);
    } catch (e) {
      this.error = (e as Error).message;
    }
  }

  async setStatus(order: any, status: string): Promise<void> {
    if (this.busyId !== null || status === order.status) return;
    this.busyId = order.id;
    this.error = this.message = '';
    try {
      const { error } = await this.supabase.client
        .from('orders')
        .update({ status })
        .eq('id', order.id);
      if (error) throw new Error(error.message);
      const updated = this.orders().map((row: any) =>
        row.id === order.id ? { ...row, status } : row
      );
      this.orders.set(updated);
      this.message = `Order ${order.order_code} marked as ${status}.`;
    } catch (e) {
      this.error = `Could not update order ${order.order_code}: ${(e as Error).message}`;
      await this.load();
    } finally {
      this.busyId = null;
    }
  }
}
