import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { AccountPageComponent } from './account-page.component';

describe('Account navigation', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('opens Account directly and through the profile alias', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/profile');
    expect(router.url).toBe('/tabs/account');
    const account = router.routerState.snapshot.root.firstChild?.firstChild?.firstChild;
    expect(account?.component).toBe(AccountPageComponent);
  });

  it('starts at Home and keeps category links working', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    expect(router.url).toBe('/tabs/tab1');
    await router.navigateByUrl('/plants');
    expect(router.url).toBe('/tabs/tab2?category=Plants');
  });

  it('offers real sign-in and links to support pages', async () => {
    const fixture = TestBed.createComponent(AccountPageComponent);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Sign in to save your profile');
    expect(fixture.nativeElement.querySelectorAll('ion-item').length).toBe(5);
  });
});
