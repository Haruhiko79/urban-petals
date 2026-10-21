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
      App.addListener('appUrlOpen', event => {
        if (!event?.url.includes('payment/callback')) return;
        try { localStorage.setItem('urban-petals.gcash-return', String(Date.now())); } catch { /* storage optional */ }
        if (!this.router.url.includes('/tabs/tab3')) void this.router.navigateByUrl('/tabs/tab3');
      });
    } catch {
      // App plugin unavailable (browser/tests) — checkout page polls instead.
    }
    void this.initializeApp();
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
