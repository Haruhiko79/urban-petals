import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { ApiService } from './api.service';
import { UserProfileService } from './user-profile.service';

describe('Server authentication', () => {
  const token = signal('');
  const request = vi.fn();
  const user = { id: 1, name: 'Buyer', email: 'buyer@example.com', phone: '09123456789', imageUrl: '' };
  beforeEach(() => {
    token.set(''); request.mockReset();
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: { token, request, setToken: (value: string) => token.set(value) } }] });
  });
  it('updates the shared profile only after successful registration', async () => {
    const service = TestBed.inject(UserProfileService);
    request.mockResolvedValueOnce({ user, token: 'server-session' });
    await service.authenticate('register', { ...user, password: 'password123' });
    expect(service.profile()).toEqual(user); expect(token()).toBe('server-session');
    token.set(''); expect(service.profile()).toBeNull();
  });
  it('rejects incorrect credentials without signing in', async () => {
    const service = TestBed.inject(UserProfileService);
    request.mockRejectedValueOnce(new Error('Incorrect email or password'));
    await expect(service.authenticate('login', { email: user.email, password: 'wrong-password' })).rejects.toThrow();
    expect(service.profile()).toBeNull();
  });
  it('revokes the session on sign out and clears the profile', async () => {
    const service = TestBed.inject(UserProfileService);
    request.mockResolvedValueOnce({ user, token: 'server-session' });
    await service.authenticate('login', { email: user.email, password: 'password123' });
    request.mockResolvedValueOnce({ success: true }); await service.signOut();
    expect(request).toHaveBeenLastCalledWith('/auth/logout', 'POST'); expect(service.profile()).toBeNull();
  });
});
