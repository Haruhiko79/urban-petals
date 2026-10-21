import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { Tab3Page } from './tab3.page';
import { UserProfileService } from '../services/user-profile.service';

describe('Checkout', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: UserProfileService, useValue: { profile: signal({ id: 1, name: 'Buyer', phone: '09123456789' }) } }] });
  });
  it('shows a receipt only after the server accepts the order', async () => {
    const component = TestBed.createComponent(Tab3Page).componentInstance;
    component.customerName = 'Buyer'; component.phone = '09123456789'; component.address = '12 Garden Street';
    const receipt = { currency: 'PHP' as const, id: 'UP-1', total: 200, status: 'pending', address: component.address, payment: 'Cash on Delivery', createdAt: '', items: [] };
    vi.spyOn(component.shop, 'placeOrder').mockResolvedValue(receipt);
    await component.checkout();
    expect(component.order).toEqual(receipt); expect(component.address).toBe(''); expect(component.busy).toBe(false);
  });
  it('keeps delivery details available to retry on failure', async () => {
    const component = TestBed.createComponent(Tab3Page).componentInstance;
    component.customerName = 'Buyer'; component.phone = '09123456789'; component.address = '12 Garden Street';
    vi.spyOn(component.shop, 'placeOrder').mockRejectedValue(new Error('Insufficient stock'));
    await component.checkout();
    expect(component.order).toBeNull(); expect(component.address).toBe('12 Garden Street');
    expect(component.error).toBe('Insufficient stock'); expect(component.busy).toBe(false);
  });
  it('places GCash orders straight from the QR scan without a reference number', async () => {
    const component = TestBed.createComponent(Tab3Page).componentInstance;
    component.customerName = 'Buyer'; component.phone = '09123456789'; component.address = '12 Garden Street';
    const placeOrder = vi.spyOn(component.shop, 'placeOrder').mockResolvedValue(null as never);
    component.payment = 'GCash';
    await component.checkout();
    expect(placeOrder).toHaveBeenCalledWith({ name: 'Buyer', phone: '09123456789', address: '12 Garden Street' }, 1, 'GCash');
  });
  it('generates a QR code when GCash is selected', async () => {
    const component = TestBed.createComponent(Tab3Page).componentInstance;
    component.onPaymentChange('GCash');
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(component.qrCode).toMatch(/^data:image\/svg\+xml;base64|data:image\/svg\+xml;charset=utf-8,/);
  });
  it('does not generate a QR code for cash on delivery', () => {
    const component = TestBed.createComponent(Tab3Page).componentInstance;
    component.onPaymentChange('Cash on Delivery');
    expect(component.qrCode).toBe('');
  });
});
