import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Product, ShopService } from './shop.service';
import { environment } from '../environments/environment';
import { ApiService } from './services/api.service';

const plant: Product = { id: 7, name: 'Plant', group: 'Plants', category: 'Plants', price: 199.95, stock: 3, image: '', description: '' };
describe('Live shopping bag', () => {
  const request = vi.fn();
  beforeEach(() => {
    localStorage.clear(); environment.apiUrl = '/api'; request.mockReset();
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: { request } }] });
  });
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); environment.apiUrl = ''; });
  function shop(): ShopService {
    const service = TestBed.runInInjectionContext(() => new ShopService());
    service.products.set([plant]); return service;
  }
  it('allows browsing the existing collection but prevents orders without an API', () => {
    environment.apiUrl = '';
    const service = TestBed.runInInjectionContext(() => new ShopService());
    service.addToCart(service.products()[0]);
    expect(service.count()).toBe(1); expect(service.preview).toBe(true);
    expect(service.canCheckout()).toBe(false);
    expect(localStorage.getItem('urban-petals.bag.v2')).toBeNull();
  });
  it('restores quantities using live prices and enforces stock limits', () => {
    const service = shop();
    for (let i = 0; i < 4; i++) service.addToCart(plant);
    expect(service.count()).toBe(3);
    expect(service.total()).toBe(599.85);
    const reopened = shop();
    expect(reopened.cart()[0].qty).toBe(3);
    reopened.changeQuantity(plant.id, -1);
    expect(shop().count()).toBe(2);
    reopened.products.set([{ ...plant, price: 100 }]);
    expect(reopened.total()).toBe(200);
  });
  it.each(['{broken', '{}', 'null', '[{"id":7,"qty":-1}]'])('ignores corrupt bag data: %s', value => {
    localStorage.setItem('urban-petals.bag.v2', value);
    expect(shop().cart()).toEqual([]);
  });
  it('does not map old demo IDs onto live products', () => {
    localStorage.setItem('urban-petals.bag', '[7]');
    expect(shop().count()).toBe(0);
  });
  it('blocks checkout for deleted or insufficient-stock products', () => {
    const service = shop(); service.addToCart(plant);
    service.products.set([{ ...plant, stock: 0 }]);
    expect(service.canCheckout()).toBe(false);
    service.products.set([]);
    expect(service.unavailableItems()).toBe(true);
    expect(service.canCheckout()).toBe(false);
    service.removeUnavailable(); expect(service.count()).toBe(0);
  });
  it('keeps the bag after a lost response and reuses the order key after reopening', async () => {
    const service = shop(); service.addToCart(plant);
    const details = { name: 'Buyer', phone: '09123456789', address: '12 Garden Street, Manila' };
    request.mockRejectedValueOnce(new Error('Connection lost'));
    await expect(service.placeOrder(details, 1)).rejects.toThrow('Connection lost');
    expect(service.count()).toBe(1);
    const firstBody = request.mock.calls[0][2];
    const reopened = shop();
    request.mockResolvedValueOnce({ order: { id: 'UP-1', total: 199.95, currency: 'PHP', items: [] } });
    const order = await reopened.placeOrder(details, 1);
    expect(request.mock.calls[1][2].requestKey).toBe(firstBody.requestKey);
    expect(order.id).toBe('UP-1');
    expect(request.mock.calls[1][2].currency).toBe('PHP');
    expect(reopened.count()).toBe(0);
  });
  it('preserves the bag if the backend returns a different currency', async () => {
    const service = shop(); service.addToCart(plant);
    request.mockResolvedValueOnce({ order: { id: 'UP-1', currency: 'USD', total: 199.95, items: [] } });
    await expect(service.placeOrder({ name: 'Buyer', phone: '09123456789', address: '12 Garden Street' }, 1)).rejects.toThrow('Unable to confirm');
    expect(service.count()).toBe(1);
  });
  it('uses a new order key after the bag changes', async () => {
    const service = shop(); service.addToCart(plant);
    const details = { name: 'Buyer', phone: '09123456789', address: '12 Garden Street, Manila' };
    request.mockRejectedValue(new Error('offline'));
    await expect(service.placeOrder(details, 1)).rejects.toThrow();
    service.addToCart(plant);
    await expect(service.placeOrder(details, 1)).rejects.toThrow();
    expect(request.mock.calls[0][2].requestKey).not.toBe(request.mock.calls[1][2].requestKey);
  });
  it('reports unavailable storage without losing the in-memory bag', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const service = shop(); service.addToCart(plant);
    expect(service.count()).toBe(1);
    expect(service.storageUnavailable()).toBe(true);
  });
  it('reports catalog failure without showing a fake successful load', async () => {
    const service = shop(); request.mockRejectedValueOnce(new Error('Offline'));
    await service.loadProducts();
    expect(service.error()).toBe('Offline'); expect(service.loading()).toBe(false);
    expect(service.canCheckout()).toBe(false);
  });
});
