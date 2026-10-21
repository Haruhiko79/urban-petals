import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonRadio, IonRadioGroup } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import QRCode from 'qrcode';
import { Capacitor } from '@capacitor/core';
import { App as AppPlugin } from '@capacitor/app';
import { Order, ShopService } from '../shop.service';
import { UserProfileService } from '../services/user-profile.service';
import { environment } from '../../environments/environment';
import { SiteHeaderComponent } from '../site-header.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [SiteHeaderComponent, FormsModule, CurrencyPipe, IonButton, IonContent, IonInput, IonItem, IonLabel, IonRadio, IonRadioGroup, RouterLink],
})
export class Tab3Page {
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly shop = inject(ShopService);
  readonly auth = inject(UserProfileService);
  readonly gcash = environment.gcash;
  customerName = '';
  phone = '';
  address = '';
  payment = 'Cash on Delivery';
  readonly paymentOptions = ['Cash on Delivery', 'GCash'];
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
    void this.resumePendingGcash();
  }

  private qrGenerated = false;
  qrCode = '';
  qrImageBroken = false;

  onPaymentChange(payment: string): void {
    if (payment !== 'GCash' || this.qrGenerated) return;
    this.qrGenerated = true;
    void QRCode.toString(`GCash: ${this.gcash.number} (${this.gcash.name})`, { type: 'svg', margin: 1, width: 220 })
      .then(svg => { this.qrCode = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`; this.changeDetector.markForCheck(); })
      .catch(() => { this.qrGenerated = false; this.changeDetector.markForCheck(); });
  }

  ionViewDidLeave(): void {
    this.active = false;
    this.order = null;
    this.address = this.customerName = this.phone = '';
    this.stopPolling();
  }

  constructor() {
    try {
      AppPlugin.addListener('appUrlOpen', event => {
        if (!event?.url.includes('payment/callback')) return;
        const pending = this.gcashOrderCode
          || (() => { try { return (JSON.parse(localStorage.getItem(Tab3Page.PENDING_KEY) || 'null') as { orderCode?: string } | null)?.orderCode; } catch { return undefined; } })() as string | undefined;
        if (pending && this.gcashState !== 'paid') void this.verifyGcash(pending);
      });
    } catch {
      // App plugin is unavailable (tests / SSR); the manual check button covers it.
    }
  }

  async checkout(): Promise<void> {
    const user = this.auth.profile();
    if (this.busy || !user || !this.customerName.trim() || !this.phone.trim() || this.address.trim().length < 10) return;
    this.busy = true;
    this.error = '';
    try {
      const order = await this.shop.placeOrder(
        { name: this.customerName.trim(), phone: this.phone.trim(), address: this.address.trim() },
        user.id,
        this.payment
      );
      this.order = order;
      this.customerName = this.phone = this.address = '';
      if (this.payment === 'GCash' && this.active) {
        this.gcashBusy = true;
        try {
          await this.startGcashCheckout(order.id);
        } catch (payError) {
          this.gcashState = 'error';
          this.error = (payError as Error).message;
          this.changeDetector.markForCheck();
        } finally {
          this.gcashBusy = false;
        }
      }
    } catch (error) { this.error = (error as Error).message; }
    finally { this.busy = false; this.changeDetector.markForCheck(); }
  }

  // â”€â”€ Real GCash flow (PayMongo) â”€â”€
  gcashBusy = false;
  gcashState: '' | 'creating' | 'checkout' | 'verifying' | 'paid' | 'failed' | 'error' = '';
  gcashCheckoutUrl = '';
  gcashOrderCode = '';
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private pollAttempts = 0;
  private static readonly PENDING_KEY = 'urban-petals.gcash-pending';

  private async startGcashCheckout(orderCode: string): Promise<void> {
    this.gcashState = 'creating';
    this.gcashOrderCode = orderCode;
    this.changeDetector.markForCheck();

    const checkout = await this.shop.createGcashPayment(orderCode);
    if (checkout.status === 'paid' || checkout.checkoutUrl === null) {
      this.gcashState = 'paid';
      this.changeDetector.markForCheck();
      return;
    }
    this.gcashCheckoutUrl = checkout.checkoutUrl;
    this.gcashState = 'checkout';
    this.changeDetector.markForCheck();

    try { localStorage.setItem(Tab3Page.PENDING_KEY, JSON.stringify({ orderCode: orderCode })); } catch { /* storage optional */ }

    this.openExternal(checkout.checkoutUrl);

    this.startPolling();
  }

  gcashRetry(): void {
    if (this.order && !this.gcashBusy) void this.startGcashCheckout(this.order.id);
  }

  gcashCheckManually(): void {
    if (this.order && !this.gcashBusy) void this.verifyGcash(this.order.id);
  }

  async verifyGcash(orderCode: string): Promise<void> {
    if (this.gcashBusy) return;
    this.gcashBusy = true;
    this.gcashState = 'verifying';
    this.stopPolling();
    this.changeDetector.markForCheck();
    try {
      const result = await this.shop.checkGcashPayment(orderCode);
      if (result.status === 'paid') {
        this.gcashState = 'paid';
        this.clearPendingGcash();
      } else if (result.status === 'failed') {
        this.gcashState = 'failed';
        this.clearPendingGcash();
      } else {
        this.gcashState = 'checkout';
        this.error = 'Not paid yet â€” open GCash again or tap "I already paid" after you approve it.';
      }
    } catch (payError) {
      this.gcashState = 'error';
      this.error = (payError as Error).message;
    } finally {
      this.gcashBusy = false;
      this.changeDetector.markForCheck();
    }
  }

  async resumePendingGcash(): Promise<void> {
    try {
      const stored = JSON.parse(localStorage.getItem(Tab3Page.PENDING_KEY) || 'null');
      if (!stored || typeof stored.orderCode !== 'string') return;
      this.gcashOrderCode = stored.orderCode;
      await this.verifyGcash(stored.orderCode);
    } catch {
      this.clearPendingGcash();
    }
  }

  gcashDiscardPending(): void {
    this.clearPendingGcash();
    this.gcashState = '';
    this.error = '';
    this.changeDetector.markForCheck();
  }

  private clearPendingGcash(): void {
    try { localStorage.removeItem(Tab3Page.PENDING_KEY); } catch { /* storage optional */ }
    this.stopPolling();
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollAttempts = 0;
    this.pollTimer = setInterval(() => {
      this.pollAttempts++;
      if (this.pollAttempts > 90) { this.stopPolling(); return; }
      void this.shop.checkGcashPayment(this.gcashOrderCode)
        .then(result => {
          if (!this.active) { this.stopPolling(); return; }
          if (result.status === 'paid') { this.gcashState = 'paid'; this.clearPendingGcash(); }
          else if (result.status === 'failed') { this.gcashState = 'failed'; this.clearPendingGcash(); }
          this.changeDetector.markForCheck();
        })
        .catch(() => undefined);
    }, 4000);
  }

  private stopPolling(): void {
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
  }

  openGcashCheckout(): void {
    if (!this.gcashCheckoutUrl) return;
    this.openExternal(this.gcashCheckoutUrl);
  }

  private openExternal(url: string): void {
    if (Capacitor.isNativePlatform()) window.location.href = url;
    else window.open(url, '_blank', 'noopener,noreferrer');
  }
}

