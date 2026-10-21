import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonInput, } from '@ionic/angular';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserProfileService } from './services/user-profile.service';
import { SiteHeaderComponent } from './site-header.component';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss'],
  imports: [SiteHeaderComponent, FormsModule, IonButton, IonContent, IonInput, RouterLink],
})
export class AuthPageComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  register = this.route.snapshot.data['mode'] === 'register';
  name = '';
  email = '';
  password = '';
  phone = '';
  busy = false;
  error = '';
  awaiting = false;
  unconfirmed = false;
  private readonly auth = inject(UserProfileService);
  private readonly router = inject(Router);

  async submit(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    try {
      const result = await this.auth.authenticate(this.register ? 'register' : 'login', {
        name: this.name.trim(), phone: this.phone.trim(), email: this.email.trim(), password: this.password,
      });
      this.password = '';
      if (result === 'pending-verification') {
        this.awaiting = true;
        this.changeDetector.markForCheck();
        return;
      }
      await this.navigateAfterAuth();
    } catch (error) {
      this.error = (error as Error).message;
      this.unconfirmed = /not confirmed/i.test(this.error);
      if (this.unconfirmed) this.email = this.email.trim();
    }
    finally { this.busy = false; this.changeDetector.markForCheck(); }
  }

  private navigateAfterAuth(): Promise<boolean> {
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
    const destination = returnTo === 'checkout' ? '/tabs/tab3' : returnTo === 'orders' ? '/orders' : '/tabs/account';
    return this.router.navigateByUrl(destination, { replaceUrl: true });
  }

  async resend(): Promise<void> {
    if (this.busy || !this.email.trim()) return;
    this.busy = true;
    this.error = '';
    try {
      await this.auth.resendVerification(this.email.trim());
      this.error = '';
    } catch (resendError) {
      this.error = (resendError as Error).message;
    }
    finally { this.busy = false; this.changeDetector.markForCheck(); }
  }

  backToSignIn(): void {
    this.awaiting = false;
    this.unconfirmed = false;
    this.register = false;
    this.error = '';
    this.changeDetector.markForCheck();
  }
}
