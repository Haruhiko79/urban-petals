import { vi } from 'vitest';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

describe('API transport', () => {
  beforeEach(() => { sessionStorage.clear(); environment.apiUrl = '/api'; });
  afterEach(() => { vi.unstubAllGlobals(); sessionStorage.clear(); environment.apiUrl = ''; });
  it('does not send credentials before an API is configured', async () => {
    environment.apiUrl = '';
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(new ApiService().request('/auth/login', 'POST', {})).rejects.toThrow('not connected');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('clears expired sessions and exposes the server error', async () => {
    const api = new ApiService(); api.setToken('expired');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Please sign in.' }), { status: 401 })));
    await expect(api.request('/auth/me')).rejects.toThrow('Please sign in.');
    expect(api.token()).toBe('');
  });
  it('handles a misconfigured server returning HTML', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Not found</html>', { status: 404 })));
    await expect(new ApiService().request('/products')).rejects.toThrow('Unable to reach Urban Petals');
  });
});
