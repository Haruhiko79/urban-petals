import { computed, inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './services/supabase.service';
import { ApiService } from './services/api.service';
import { environment } from '../environments/environment';
import { CATALOG_PREVIEW } from './catalog-preview';

export interface Product {
  id: number;
  name: string;
  group: string;
  category: string;
  price: number;
  stock: number | null;
  image: string;
  description: string;
  badge?: string;
}

export interface Order {
  currency: 'PHP';
  id: string;
  total: number;
  status: string;
  createdAt: string;
  address: string;
  payment: string;
  items: { name: string; qty: number; price: number }[];
}

interface CartLine {
  id: number;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class ShopService {
  private readonly supabase = inject(SupabaseService);
  private readonly api = inject(ApiService);
  readonly preview = !this.supabase.isConfigured && !environment.apiUrl;
  private readonly bagKey = this.preview ? 'urban-petals.bag.preview' : 'urban-petals.bag.v2';
  readonly storageUnavailable = signal(false);
  readonly products = signal<Product[]>(this.preview ? CATALOG_PREVIEW : []);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly feedback = signal('');
  private readonly items = signal<CartLine[]>(this.restoreCart());
  private attempt: { fingerprint: string; key: string } | null = this.restoreAttempt();

  readonly cart = computed(() =>
    this.items().flatMap(line => {
      const product = this.products().find(product => product.id === line.id);
      return product ? [{ ...product, qty: line.qty }] : [];
    })
  );

  readonly count = computed(() => this.items().reduce((sum, line) => sum + line.qty, 0));
  readonly unavailableItems = computed(() => this.items().length !== this.cart().length);
  readonly canCheckout = computed(
    () =>
      !this.preview &&
      !this.loading() &&
      !this.error() &&
      !this.unavailableItems() &&
      this.cart().length > 0 &&
      this.cart().every(item => item.stock !== null && item.qty <= item.stock)
  );

  async loadProducts(): Promise<void> {
    if (this.preview || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      if (this.supabase.isConfigured) {
        const { data, error } = await this.supabase.client
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: true });

        if (error) throw new Error(error.message);

        if (!Array.isArray(data) || data.length === 0) {
          this.products.set(CATALOG_PREVIEW);
          return;
        }

        const mapped: Product[] = data.map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          group: item.group || 'Plants',
          category: item.category || 'General',
          price: Number(item.price) || 0,
          stock: item.stock !== undefined && item.stock !== null ? Number(item.stock) : Number(item.quantity ?? 50),
          image: item.image && /^https?:\/\//.test(item.image) ? item.image : 'assets/icon/favicon.png',
          description: item.description || '',
          badge: item.badge || undefined,
        }));

        this.products.set(mapped);
      } else if (environment.apiUrl) {
      } else if (environment.apiUrl) {
        const { products } = await this.api.request<{ products: Product[] }>('/products');
        if (
          !Array.isArray(products) ||
          products.some(
            product =>
              !Number.isInteger(product.id) ||
              typeof product.name !== 'string' ||
              typeof product.price !== 'number' ||
              !Number.isFinite(product.price) ||
              product.price < 0 ||
              !Number.isInteger(product.stock) ||
              (product.stock ?? -1) < 0
          )
        ) {
          throw new Error('The product catalog is unavailable. Please try again later.');
        }
        this.products.set(
          products.map(product => ({
            ...product,
            image: /^https:\/\//.test(product.image) ? product.image : 'assets/icon/favicon.png',
          }))
        );
      }
    } catch (error) {
      this.error.set((error as Error).message);
      this.products.set(CATALOG_PREVIEW);
    } finally {
      this.loading.set(false);
    }
  }

  addToCart(product: Product): void {
    const line = this.items().find(line => line.id === product.id);
    if ((line?.qty || 0) >= Math.min(product.stock ?? 99, 99)) {
      this.feedback.set('You have reached the available quantity.');
      return;
    }
    this.saveCart(
      line
        ? this.items().map(item => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
        : [...this.items(), { id: product.id, qty: 1 }]
    );
    this.feedback.set(`${product.name} added to your bag.`);
  }

  changeQuantity(id: number, delta: number): void {
    const product = this.products().find(product => product.id === id);
    if (delta > 0 && product) {
      this.addToCart(product);
      return;
    }
    this.saveCart(
      this.items()
        .map(line => (line.id === id ? { ...line, qty: line.qty - 1 } : line))
        .filter(line => line.qty > 0)
    );
  }

  removeFromCart(id: number): void {
    this.saveCart(this.items().filter(line => line.id !== id));
  }

  removeUnavailable(): void {
    this.saveCart(this.items().filter(line => this.products().some(product => product.id === line.id)));
  }

  clearCart(): void {
    this.saveCart([]);
  }

  total(): number {
    return this.cart().reduce((sum, product) => sum + Math.round(product.price * 100) * product.qty, 0) / 100;
  }

  async placeOrder(
    details: { name: string; phone: string; address: string },
    userId: string | number
  ): Promise<Order> {
    if (!this.canCheckout()) {
      throw new Error('Refresh your bag and check available quantities before ordering.');
    }

    if (this.supabase.isConfigured) {
      const orderCode = `UP-${Date.now().toString().slice(-6)}`;
      const totalAmount = this.total();

      const { data: orderData, error: orderError } = await this.supabase.client
        .from('orders')
        .insert({
          order_code: orderCode,
          user_id: typeof userId === 'string' ? userId : null,
          customer_name: details.name,
          contact_number: details.phone,
          address: details.address,
          payment_method: 'Cash on Delivery',
          status: 'pending',
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (orderError) throw new Error(orderError.message);

      const itemsToInsert = this.cart().map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        unit_price: item.price,
        quantity: item.qty,
        subtotal: Math.round(item.price * item.qty * 100) / 100,
      }));

      const { error: itemsError } = await this.supabase.client.from('order_items').insert(itemsToInsert);

      if (itemsError) {
        console.warn('Could not record order items:', itemsError.message);
      }

      const confirmedOrder: Order = {
        id: orderData.order_code,
        currency: 'PHP',
        total: Number(orderData.total_amount),
        status: orderData.status,
        createdAt: orderData.created_at,
        address: orderData.address,
        payment: orderData.payment_method,
        items: this.cart().map(item => ({ name: item.name, qty: item.qty, price: item.price })),
      };

      this.clearCart();
      return confirmedOrder;
    } else {
      const items = this.cart().map(item => ({ id: item.id, qty: item.qty, price: item.price }));
      const fingerprint = JSON.stringify({ userId, items });
      if (this.attempt?.fingerprint !== fingerprint) {
        this.attempt = { fingerprint, key: crypto.randomUUID() };
        try {
          localStorage.setItem('urban-petals.order-attempt', JSON.stringify(this.attempt));
        } catch {
          this.storageUnavailable.set(true);
        }
      }
      const { order } = await this.api.request<{ order: Order }>('/orders', 'POST', {
        ...details,
        items,
        currency: 'PHP',
        payment: 'Cash on Delivery',
        requestKey: this.attempt!.key,
      });
      if (
        !order ||
        typeof order.id !== 'string' ||
        order.currency !== 'PHP' ||
        order.total < 0 ||
        !Number.isFinite(order.total) ||
        !Array.isArray(order.items)
      ) {
        throw new Error('Unable to confirm your order. Check your order history before trying again.');
      }
      this.clearCart();
      this.attempt = null;
      try {
        localStorage.removeItem('urban-petals.order-attempt');
      } catch {
        this.storageUnavailable.set(true);
      }
      return order;
    }
  }

  private restoreAttempt(): { fingerprint: string; key: string } | null {
    try {
      const value = JSON.parse(localStorage.getItem('urban-petals.order-attempt') || 'null');
      return typeof value?.fingerprint === 'string' && typeof value?.key === 'string' ? value : null;
    } catch {
      return null;
    }
  }

  private restoreCart(): CartLine[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(this.bagKey) || '[]');
      if (!Array.isArray(value)) return [];
      const seen = new Set<number>();
      return value
        .filter(line => {
          if (
            !line ||
            !Number.isInteger(line.id) ||
            line.id <= 0 ||
            !Number.isInteger(line.qty) ||
            line.qty < 1 ||
            line.qty > 99 ||
            seen.has(line.id)
          ) {
            return false;
          }
          seen.add(line.id);
          return true;
        })
        .slice(0, 100)
        .map(({ id, qty }) => ({ id, qty }));
    } catch {
      this.storageUnavailable.set(true);
      return [];
    }
  }

  private saveCart(items: CartLine[]): void {
    this.items.set(items);
    try {
      localStorage.setItem(this.bagKey, JSON.stringify(items));
      this.storageUnavailable.set(false);
    } catch {
      this.storageUnavailable.set(true);
    }
  }
}
