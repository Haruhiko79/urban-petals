import { Component, inject, signal, OnDestroy } from '@angular/core';
import { IonButton, IonContent } from '@ionic/angular';
import { CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Product, ShopService } from '../shop.service';
import { SiteHeaderComponent } from '../site-header.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [CurrencyPipe, SiteHeaderComponent, IonButton, IonContent, RouterLink],
})
export class Tab1Page implements OnDestroy {
  readonly collectionSlides = [
    { title: 'Plant Collection', tag: 'Indoor / Outdoor', description: 'Vibrant plants for every room, garden or balcony.', image: 'https://images.squarespace-cdn.com/content/v1/54fbb611e4b0d7c1e151d22a/1610074066643-OP8HDJUWUH8T5MHN879K/Snake+Plant.jpg?format=1000w', category: 'Plants' },
    { title: 'Premium Garden Tools', tag: 'Tools', description: 'Reliable tools built for comfort and durability.', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80', category: 'Tools' },
    { title: 'Pot Collection', tag: 'Planters', description: 'Beautiful homes for the things you grow.', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&q=80', category: 'Pots' },
    { title: 'Flower Collection', tag: 'Seasonal blooms', description: 'Colour and life for every corner of your home.', image: 'https://gardenia.net/wp-content/uploads/2023/05/types-of-flowers.webp', category: 'Flowers' },
    { title: 'Fertilizers', tag: 'Growth', description: 'Nourishment for stronger roots and brighter growth.', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&q=80', category: 'Fertilizers' },
  ];
  readonly currentSlide = signal(0);
  readonly paused = signal(false);
  private timer?: ReturnType<typeof setInterval>;
  private pointerStart: { x: number; y: number } | null = null;
  private swiped = false;
  get featuredProducts(): Product[] { return this.shop.products().slice(0, 4); }
  readonly categories = [
    { name: 'Plants', icon: '🌿', caption: 'Indoor & outdoor varieties' },
    { name: 'Flowers', icon: '🌸', caption: 'Seasonal & year-round blooms' },
    { name: 'Tools', icon: '🛠️', caption: 'Premium gardening equipment' },
    { name: 'Pots', icon: '🪴', caption: 'Ceramic, clay & modern styles' },
    { name: 'Fertilizers', icon: '🌱', caption: 'Organic & synthetic blends' },
  ];

  readonly shop = inject(ShopService);
  private readonly router = inject(Router);

  add(event: Event, product: Product): void {
    event.stopPropagation();
    this.shop.addToCart(product);
  }

  openDetails(product: Product): void {
    void this.router.navigate(['/product', product.id]);
  }

  ionViewWillEnter(): void {
    void this.shop.loadProducts();
    this.paused.set(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    this.startRotation();
  }
  ionViewDidLeave(): void { this.stopRotation(); }
  ngOnDestroy(): void { this.stopRotation(); }
  private stopRotation(): void { if (this.timer) clearInterval(this.timer); }
  private startRotation(): void {
    this.stopRotation();
    this.timer = setInterval(() => {
      if (!this.paused() && !document.hidden) this.currentSlide.update(index => (index + 1) % this.collectionSlides.length);
    }, 6000);
  }
  pause(): void { this.paused.set(true); }
  toggleRotation(): void { this.paused.update(paused => !paused); }
  nextSlide(): void { this.pause(); this.currentSlide.update(index => (index + 1) % this.collectionSlides.length); }
  previousSlide(): void { this.pause(); this.currentSlide.update(index => (index - 1 + this.collectionSlides.length) % this.collectionSlides.length); }
  goToSlide(index: number): void { this.pause(); this.currentSlide.set(index); }
  pointerDown(event: PointerEvent): void {
    this.pointerStart = { x: event.clientX, y: event.clientY }; this.swiped = false;
  }
  pointerUp(event: PointerEvent): void {
    if (!this.pointerStart) return;
    const dx = event.clientX - this.pointerStart.x;
    const dy = event.clientY - this.pointerStart.y;
    this.pointerStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      this.swiped = true;
      if (dx < 0) this.nextSlide(); else this.previousSlide();
    }
  }
  slideClick(event: Event): void {
    if (this.swiped) { event.preventDefault(); event.stopPropagation(); this.swiped = false; }
  }
}
