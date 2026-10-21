import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonInput, IonItem, IonLabel } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Order, ShopService } from '../shop.service';
import { UserProfileService } from '../services/user-profile.service';
import { SiteHeaderComponent } from '../site-header.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [SiteHeaderComponent, FormsModule, CurrencyPipe, IonButton, IonContent, IonInput, IonItem, IonLabel, RouterLink],
})
export class Tab3Page {
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly shop = inject(ShopService);
  readonly auth = inject(UserProfileService);
  customerName = '';
  phone = '';
  address = '';
  order: Order | null = null;
  busy = false;
  private active = true;
  error = '';

  ionViewWillEnter(): void {
    this.active = true;
    this.order = null;
    this.error = '';
    this.customerName = this.auth.profile()?.name || '';
    this.phone = this.auth.profile()?.phone || '';
    void this.shop.loadProducts();
  }

  ionViewDidLeave(): void { this.active = false; this.order = null; this.address = this.customerName = this.phone = ''; }

  async checkout(): Promise<void> {
    const user = this.auth.profile();
    if (this.busy || !user || !this.customerName.trim() || !this.phone.trim() || this.address.trim().length < 10) return;
    this.busy = true;
    this.error = '';
    try {
      const order = await this.shop.placeOrder({ name: this.customerName.trim(), phone: this.phone.trim(), address: this.address.trim() }, user.id);
      if (this.active && this.auth.profile()?.id === user.id) this.order = order;
      this.customerName = this.phone = this.address = '';
    } catch (error) { this.error = (error as Error).message; }
    finally { this.busy = false; this.changeDetector.markForCheck(); }
  }
}
