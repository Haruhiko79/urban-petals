import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList } from '@ionic/angular';
import { SiteHeaderComponent } from './site-header.component';
import { UserProfileService } from './services/user-profile.service';
import { ShopService } from './shop.service';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss'],
  imports: [SiteHeaderComponent, RouterLink, FormsModule, IonInput, IonButton, IonContent, IonItem, IonLabel, IonList],
})
export class AccountPageComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly auth = inject(UserProfileService);
  private readonly shop = inject(ShopService);
  name = '';
  phone = '';
  imageUrl = '';
  busy = false;
  loading = false;
  processingPhoto = false;
  error = '';
  message = '';

  async ionViewWillEnter(): Promise<void> {
    this.error = this.message = '';
    this.loading = true;
    try {
      await this.auth.restore();
      const user = this.auth.profile();
      if (user) {
        this.name = user.name; this.phone = user.phone; this.imageUrl = user.imageUrl;
      }
    } catch (error) { this.error = (error as Error).message; }
    finally { this.loading = false; this.changeDetector.markForCheck(); }
  }

  async save(): Promise<void> {
    if (this.busy || this.processingPhoto) return;
    this.busy = true; this.error = this.message = '';
    try {
      await this.auth.save({ name: this.name.trim(), phone: this.phone.trim(), imageUrl: this.imageUrl });
      this.message = 'Your profile has been updated.';
    } catch (error) { this.error = (error as Error).message; }
    finally { this.busy = false; this.changeDetector.markForCheck(); }
  }

  async choosePhoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error = '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.error = 'Choose a JPEG, PNG or WebP photo smaller than 5 MB.'; input.value = ''; return;
    }
    this.processingPhoto = true;
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Photo editing is unavailable on this device.');
      const size = Math.min(bitmap.width, bitmap.height);
      context.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 256, 256);
      bitmap.close();
      this.imageUrl = canvas.toDataURL('image/jpeg', 0.85);
      this.message = 'Photo ready. Save your profile to apply it.';
    } catch { this.error = 'Unable to open this photo. Please choose another.'; }
    finally { input.value = ''; this.processingPhoto = false; this.changeDetector.markForCheck(); }
  }

  async signOut(): Promise<void> {
    if (this.busy) return;
    this.busy = true; this.error = '';
    try {
      await this.auth.signOut();
      this.shop.clearCart();
      this.name = this.phone = this.imageUrl = this.message = '';
    } catch (error) { this.error = (error as Error).message; }
    finally { this.busy = false; this.changeDetector.markForCheck(); }
  }
}
