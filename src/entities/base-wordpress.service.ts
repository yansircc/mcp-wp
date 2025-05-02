import { fetchWpApi } from '../lib/api-client.js';

export interface FetchOptions extends RequestInit {
  needsAuth?: boolean;
  params?: Record<string, string | number | string[]>;
}

export abstract class BaseWordPressService {
  protected abstract endpoint: string;

  protected async request<T>(path: string, options: FetchOptions): Promise<T> {
    const url = `${this.endpoint}${path}`;
    const result = await fetchWpApi<T>(url, {
      ...options,
      needsAuth: true,
    });
    if (result === null) {
      throw new Error(`Request to ${url} returned null`);
    }
    return result;
  }
}
