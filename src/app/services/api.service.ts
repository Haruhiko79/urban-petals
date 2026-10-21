import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly token = signal(this.restoreToken());

  setToken(token: string): void {
    this.token.set(token);
    try {
      if (token) sessionStorage.setItem('urban-petals.session', token);
      else sessionStorage.removeItem('urban-petals.session');
    } catch { /* The session can still work in memory. */ }
  }

  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    if (!environment.apiUrl) throw new ApiError('Online services are not connected yet. Please try again later.', 503);
    const token = this.token();
    try {
      const response = await fetch(`${environment.apiUrl.replace(/\/$/, '')}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
        credentials: 'omit',
      });
      if (response.status === 401 && token && this.token() === token) this.setToken('');
      const data = await response.json();
      if (!response.ok) throw new ApiError(typeof data?.error === 'string' ? data.error : 'Unable to complete this request.', response.status);
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Unable to reach Urban Petals. Check your connection and try again.', 0);
    }
  }

  private restoreToken(): string {
    try { return sessionStorage.getItem('urban-petals.session') || ''; } catch { return ''; }
  }
}
