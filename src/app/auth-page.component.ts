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
  readonly register = this.route.snapshot.data['mode'] === 'register';
  name = '';
  email = '';
  password = '';
  phone = '';
  busy = false;
  error = '';
  private readonly auth = inject(UserProfileService);
  private readonly router = inject(Router);

  async submit(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    try {
      await this.auth.authenticate(this.register ? 'register' : 'login', {
        name: this.name.trim(), phone: this.phone.trim(), email: this.email.trim(), password: this.password,
      });
      this.password = '';
      const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
      const destination = returnTo === 'checkout' ? '/tabs/tab3' : returnTo === 'orders' ? '/orders' : '/tabs/account';
      await this.router.navigateByUrl(destination, { replaceUrl: true });
    } catch (error) { this.error = (error as Error).message; }
    finally { this.busy = false; this.changeDetector.markForCheck(); }
  }
}
