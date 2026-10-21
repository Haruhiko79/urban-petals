import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonInput, IonSegment, IonSegmentButton, IonSelect, IonSelectOption } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ShopService } from '../shop.service';
import { SiteHeaderComponent } from '../site-header.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [CurrencyPipe, SiteHeaderComponent, FormsModule, IonButton, IonContent, IonInput, IonSegment, IonSegmentButton, IonSelect, IonSelectOption]
})
export class Tab2Page {

  readonly categories = ['All', 'Plants', 'Flowers', 'Tools', 'Pots', 'Fertilizers'];
  selectedCategory = 'All';
  searchTerm = '';

  readonly shop = inject(ShopService);
  private readonly router = inject(Router);

  constructor() {
    const route = inject(ActivatedRoute);
    route.queryParamMap.subscribe((params) => {
      const category = params.get('category');
      this.selectedCategory = category && this.categories.includes(category) ? category : 'All';
    });
  }

  get visibleProducts(): Product[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.shop.products().filter((product) =>
      (this.selectedCategory === 'All' || product.group === this.selectedCategory) &&
      (!search || `${product.name} ${product.category}`.toLowerCase().includes(search)),
    );
  }

  ionViewWillEnter(): void { void this.shop.loadProducts(); }

  add(event: Event, product: Product): void {
    event.stopPropagation();
    this.shop.addToCart(product);
  }

  openDetails(product: Product): void {
    void this.router.navigate(['/product', product.id]);
  }

}
