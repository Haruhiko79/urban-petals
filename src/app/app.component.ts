import { Component, inject, signal } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { SideMenuComponent } from './side-menu.component';
import { UserProfileService } from './services/user-profile.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, SideMenuComponent],
})
export class AppComponent {
  readonly starting = signal(true);
  private readonly platform = inject(Platform);
  private readonly auth = inject(UserProfileService);
  private readonly router = inject(Router);

  constructor() {
    try {
      App.addListener('appUrlOpen', event => this.processLink(event?.url ?? ''));
    } catch {
      // App plugin unavailable (browser/tests) — email confirm + checkout polling degrade gracefully.
    }
    void this.initializeApp();
  }

  private processLink(url: string): void {
    if (url.includes('payment/callback')) {
      try { localStorage.setItem('urban-petals.gcash-return', String(Date.now())); } catch { /* storage optional */ }
      if (!this.router.url.includes('/tabs/tab3')) void this.router.navigateByUrl('/tabs/tab3');
      return;
    }
    if (url.includes('auth-callback')) void this.finishAuthRedirect(url).catch(() => undefined);
  }

  private async finishAuthRedirect(url: string): Promise<void> {
    let signedIn = false;
    let badRequest = false;
    let parsed: URL | null = null;
    try { parsed = new URL(url); } catch { /* not a parseable URL */ }
    if (parsed) {
      const query = parsed.searchParams;
      if (query.get('error_code') || query.get('error')) badRequest = true;
      const code = query.get('code');
      const fragment = parsed.hash ? new URLSearchParams(parsed.hash.slice(1)) : null;
      const accessToken = fragment?.get('access_token') ?? null;
      const refreshToken = fragment?.get('refresh_token') ?? null;
      const payloadError = fragment?.get('error_code') ?? fragment?.get('error');
      if (!badRequest && payloadError) badRequest = true;
      if (!badRequest && accessToken && refreshToken) {
        await this.auth.setSession(accessToken, refreshToken);
        signedIn = true;
      } else if (!badRequest && code) {
        const { error } = await this.auth.exchangeCodeForSession(code);
        signedIn = !error;
      }
    }
    if (signedIn) {
      await this.auth.restore();
      await this.router.navigateByUrl('/tabs/account', { replaceUrl: true });
    } else {
      // Expired links land here as "error_code=otp_expired" from Supabase.
      const destination = badRequest ? '/signin?notice=link-expired' : '/signin';
      await this.router.navigateByUrl(destination, { replaceUrl: true });
    }
  }

  async initializeApp(): Promise<void> {
    try {
      await this.platform.ready();
      // Restore independently so a slow network never traps the user behind the splash.
      void this.auth.restore().catch(() => undefined);
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    } finally {
      this.starting.set(false);
      if (Capacitor.isNativePlatform()) await SplashScreen.hide().catch(() => undefined);
    }
  }
}
