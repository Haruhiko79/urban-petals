import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { OrdersPageComponent } from './orders-page.component';
import { ApiService } from './services/api.service';
import { UserProfileService } from './services/user-profile.service';
import { routes } from './app.routes';

describe('My orders', () => {
  const request = vi.fn();
  const profile = signal<{ id: number } | null>({ id: 1 });
  const order = { id: 'UP-1', currency: 'PHP', total: 1234.5, status: 'pending', createdAt: '2026-10-11T00:00:00Z', address: 'Manila', payment: 'Cash on Delivery', items: [{ name: 'Plant', qty: 2, price: 617.25 }] };
  beforeEach(() => {
    request.mockReset(); profile.set({ id: 1 });
    TestBed.configureTestingModule({ providers: [provideRouter(routes),
      { provide: ApiService, useValue: { request } },
      { provide: UserProfileService, useValue: { profile, restore: vi.fn().mockResolvedValue(undefined) } },
    ] });
  });
  it('opens the dedicated orders route', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/orders');
    expect(router.url).toBe('/orders');
    expect(router.routerState.snapshot.root.firstChild?.component).toBe(OrdersPageComponent);
  });
  it('renders peso totals, quantities and delivery details from the API', async () => {
    request.mockResolvedValueOnce({ orders: [order] });
    const fixture = TestBed.createComponent(OrdersPageComponent);
    await fixture.componentInstance.load(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('₱1,234.50');
    expect(fixture.nativeElement.textContent).toContain('2 × ₱617.25');
    expect(fixture.nativeElement.textContent).toContain('Manila');
    expect(request).toHaveBeenCalledWith('/orders');
  });
  it('does not mislabel another currency as pesos', async () => {
    request.mockResolvedValueOnce({ orders: [{ ...order, currency: 'USD' }] });
    const component = TestBed.createComponent(OrdersPageComponent).componentInstance;
    await component.load();
    expect(component.orders()).toEqual([]); expect(component.error()).toBeTruthy();
  });
  it('does not fetch private orders when signed out', async () => {
    profile.set(null);
    const component = TestBed.createComponent(OrdersPageComponent).componentInstance;
    await component.load();
    expect(request).not.toHaveBeenCalled(); expect(component.loading()).toBe(false);
  });
});
