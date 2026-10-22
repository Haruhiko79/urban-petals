import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../site-header.component';
import { SupabaseService } from '../services/supabase.service';

interface ProductDraft {
  name: string;
  group: string;
  category: string;
  price: number | null;
  stock: number | null;
  image: string;
  description: string;
  badge: string;
  item_code: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, SiteHeaderComponent, IonButton, IonContent, IonHeader, IonInput, IonTitle, IonToolbar, RouterLink],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./products.css', '../admin-shared.css']
})
export class AdminProductsComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  readonly groups = ['Plants', 'Flowers', 'Tools', 'Pots', 'Fertilizers'];
  products = signal<any[]>([]);
  search = signal('');
  busy = false;
  loading = false;
  error = '';
  message = '';
  editingId: number | 'new' | null = null;
  draft: ProductDraft = this.emptyDraft();

  visibleProducts = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.products();
    return this.products().filter((product: any) =>
      [product.name, product.item_code, product.category, product.group, product.description]
        .some((value: any) => String(value ?? '').toLowerCase().includes(term))
    );
  });

  imageFor(product: any): string {
    return product.image && /^https?:\/\//.test(product.image) ? product.image : 'assets/icon/flower-mark.svg';
  }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.supabase.isConfigured) return;
    this.loading = true;
    this.error = '';
    try {
      const { data, error } = await this.supabase.client
        .from('products')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      this.products.set(data || []);
    } catch (e) {
      this.error = (e as Error).message;
    } finally {
      this.loading = false;
    }
  }

  openEditor(product: any | null): void {
    this.error = this.message = '';
    this.editingId = product ? product.id : 'new';
    this.draft = product ? {
      name: product.name ?? '',
      group: product.group ?? 'Plants',
      category: product.category ?? '',
      price: product.price ?? null,
      stock: product.stock ?? product.quantity ?? null,
      image: product.image ?? '',
      description: product.description ?? '',
      badge: product.badge ?? '',
      item_code: product.item_code ?? '',
    } : this.emptyDraft();
  }

  closeEditor(): void {
    this.editingId = null;
    this.draft = this.emptyDraft();
  }

  private emptyDraft(): ProductDraft {
    return { name: '', group: 'Plants', category: '', price: null, stock: null, image: '', description: '', badge: '', item_code: '' };
  }

  get formValid(): boolean {
    return (
      this.draft.name.trim().length > 0 &&
      this.draft.category.trim().length > 0 &&
      this.draft.price !== null && this.draft.price > 0 &&
      this.draft.stock !== null && this.draft.stock >= 0 &&
      (this.draft.image.length === 0 || /^https?:\/\//.test(this.draft.image.trim()))
    );
  }

  async save(): Promise<void> {
    if (this.busy || !this.formValid) return;
    this.busy = true;
    this.error = this.message = '';
    const stock = Math.floor(this.draft.stock!);
    const payload: Record<string, unknown> = {
      name: this.draft.name.trim(),
      group: this.draft.group,
      category: this.draft.category.trim(),
      price: this.draft.price!,
      stock,
      quantity: stock,
      image: this.draft.image.trim() || null,
      description: this.draft.description.trim(),
      badge: this.draft.badge.trim() || null,
    };
    try {
      if (this.editingId === 'new') {
        payload['item_code'] = this.draft.item_code.trim() || `UP-${Date.now().toString().slice(-6)}`;
        payload['is_active'] = true;
        const { error } = await this.supabase.client.from('products').insert(payload);
        if (error) throw new Error(error.message);
        this.message = `${payload['name'] as string} added to the store.`;
      } else {
        const { error } = await this.supabase.client
          .from('products')
          .update(payload)
          .eq('id', this.editingId as number);
        if (error) throw new Error(error.message);
        this.message = `${payload['name'] as string} updated.`;
      }
      this.closeEditor();
      await this.load();
    } catch (e) {
      this.error = `Could not save the product: ${(e as Error).message}`;
    } finally {
      this.busy = false;
    }
  }

  async toggleActive(product: any): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.error = this.message = '';
    try {
      const { error } = await this.supabase.client
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
      if (error) throw new Error(error.message);
      const updated = this.products().map((row: any) =>
        row.id === product.id ? { ...row, is_active: !product.is_active } : row
      );
      this.products.set(updated);
      this.message = `${product.name} ${product.is_active ? 'deactivated â€” it is now hidden from the shop.' : 'reactivated in the shop.'}`;
    } catch (e) {
      this.error = `Could not change â€œ${product.name}â€: ${(e as Error).message}`;
    } finally {
      this.busy = false;
    }
  }
}
