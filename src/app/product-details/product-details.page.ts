import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Product, ShopService } from '../shop.service';
import { SiteHeaderComponent } from '../site-header.component';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
  imports: [CurrencyPipe, RouterLink, SiteHeaderComponent, IonButton, IonContent],
})
export class ProductDetailsPage {
  readonly shop = inject(ShopService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly id = toSignal(this.route.paramMap.pipe(map(p => Number(p.get('id')))), { initialValue: NaN });

  readonly quantity = signal(1);
  readonly added = signal(false);

  readonly product = computed<Product | undefined>(() => this.shop.products().find(p => p.id === this.id()));

  readonly maxQty = computed(() => Math.max(1, Math.min(this.product()?.stock ?? 99, 99)));
  readonly soldOut = computed(() => this.product()?.stock === 0);
  readonly lowStock = computed(() => {
    const stock = this.product()?.stock;
    return stock !== null && stock !== undefined && stock > 0 && stock <= 5;
  });

  readonly related = computed(() => {
    const current = this.product();
    if (!current) return [];
    return this.shop
      .products()
      .filter(p => p.id !== current.id && p.group === current.group)
      .slice(0, 4);
  });

  readonly highlights = computed(() => {
    const p = this.product();
    if (!p) return [];
    return [
      { icon: 'ðŸŒ¿', title: 'Carefully selected', text: 'Hand-picked and checked before it leaves us.' },
      { icon: 'ðŸ“¦', title: 'Packed with care', text: 'Protected packaging for safe delivery.' },
      { icon: 'ðŸ’¬', title: 'Growing advice', text: 'Questions? Our team is happy to help.' },
    ];
  });

  constructor() {
    void this.shop.loadProducts();
    // Reset state when navigating between products.
    effect(() => {
      this.id();
      this.quantity.set(1);
      this.added.set(false);
    });
  }

  decrease(): void {
    this.quantity.update(q => Math.max(1, q - 1));
  }

  increase(): void {
    this.quantity.update(q => Math.min(this.maxQty(), q + 1));
  }

  addToBag(): void {
    const p = this.product();
    if (!p || this.soldOut()) return;
    for (let i = 0; i < this.quantity(); i++) this.shop.addToCart(p);
    this.added.set(true);
  }

  buyNow(): void {
    this.addToBag();
    void this.router.navigateByUrl('/tabs/tab3');
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/icon/flower-mark.svg';
  }
}
