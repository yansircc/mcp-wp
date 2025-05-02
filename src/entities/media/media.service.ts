import {
  BaseWordPressService,
  FetchOptions,
} from '../base-wordpress.service.js';
import type {
  MediaItem,
  MediaQueryParams,
  MediaCreateParams,
  MediaUpdateParams,
} from './types.js';

export class MediaService extends BaseWordPressService {
  protected endpoint = '/wp/v2/media';

  /**
   * Get a list of media items
   */
  async list(params?: MediaQueryParams): Promise<MediaItem[]> {
    const convertedParams: Record<string, string | number | string[]> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          if (
            Array.isArray(value) &&
            value.every((item) => typeof item === 'number')
          ) {
            convertedParams[key] = value.join(',');
          } else {
            convertedParams[key] = value as string | number | string[];
          }
        }
      }
    }
    const result = await this.request<MediaItem[]>('', {
      params: convertedParams,
    });
    return result;
  }

  /**
   * Get a single media item by ID
   */
  async get(id: number): Promise<MediaItem> {
    return this.request<MediaItem>(`/${id}`, {});
  }

  /**
   * Create a new media item
   * Note: This method requires sending a multipart/form-data request
   */
  async create(params: MediaCreateParams): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.title) formData.append('title', params.title);
    if (params.caption) formData.append('caption', params.caption);
    if (params.description) formData.append('description', params.description);
    if (params.alt_text) formData.append('alt_text', params.alt_text);
    if (params.post) formData.append('post', params.post.toString());

    return this.request<MediaItem>('', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Update an existing media item
   */
  async update(id: number, params: MediaUpdateParams): Promise<MediaItem> {
    return this.request<MediaItem>(`/${id}`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Delete a media item
   */
  async delete(id: number, force = false): Promise<MediaItem> {
    return this.request<MediaItem>(`/${id}`, {
      method: 'DELETE',
      params: force ? { force: '1' } : undefined,
    });
  }

  /**
   * Get media item by slug
   * @throws {Error} When no media item is found with the given slug
   */
  async getBySlug(slug: string): Promise<MediaItem> {
    const result = await this.list({ slug });
    if (!result || result.length === 0) {
      throw new Error(`No media found with slug: ${slug}`);
    }
    const item = result[0];
    if (!item) {
      throw new Error(`No media found with slug: ${slug}`);
    }
    return item;
  }

  /**
   * Edit media item metadata
   */
  async editMetadata(
    id: number,
    params: MediaUpdateParams
  ): Promise<MediaItem> {
    return this.request<MediaItem>(`/${id}`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
