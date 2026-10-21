import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ContactPageComponent } from './contact-page.component';
import { ApiService } from './services/api.service';

describe('Contact submission', () => {
  it('preserves the message on failure and confirms only a successful API response', async () => {
    const request = vi.fn().mockRejectedValueOnce(new Error('Not connected')).mockResolvedValueOnce({ success: true });
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ApiService, useValue: { request } }] });
    const component = TestBed.createComponent(ContactPageComponent).componentInstance;
    component.firstName = 'Buyer'; component.email = 'buyer@example.com'; component.subject = 'Order & Delivery'; component.message = 'Where is my order?';
    await component.submit();
    expect(component.sent()).toBe(false); expect(component.message).toBe('Where is my order?');
    await component.submit();
    expect(component.sent()).toBe(true); expect(component.message).toBe('');
  });
});
