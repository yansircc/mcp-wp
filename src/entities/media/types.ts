export interface MediaItem {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
    raw?: string;
  };
  link: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  permalink_template?: string;
  generated_slug?: string;
  title: {
    rendered: string;
    raw?: string;
  };
  author: number;
  comment_status: string;
  ping_status: string;
  meta: Record<string, any>;
  template?: string;
  alt_text?: string;
  caption?: {
    rendered: string;
    raw?: string;
  };
  description?: {
    rendered: string;
    raw?: string;
  };
  media_type: string;
  mime_type: string;
  media_details: {
    width?: number;
    height?: number;
    file?: string;
    sizes?: Record<
      string,
      {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      }
    >;
    image_meta?: Record<string, any>;
  };
  post?: number;
  source_url: string;
  missing_image_sizes?: string[];
  _links?: Record<string, any>;
}

export interface MediaCreateParams {
  file: File | Blob;
  title?: string;
  status?: string;
  caption?: string;
  description?: string;
  alt_text?: string;
  post?: number;
}

export interface MediaUpdateParams {
  title?: string;
  status?: string;
  caption?: string;
  description?: string;
  alt_text?: string;
  post?: number;
}

export interface MediaQueryParams {
  context?: 'view' | 'embed' | 'edit';
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  author?: number | number[];
  author_exclude?: number | number[];
  before?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?:
    | 'author'
    | 'date'
    | 'id'
    | 'include'
    | 'modified'
    | 'parent'
    | 'relevance'
    | 'slug'
    | 'include_slugs'
    | 'title';
  parent?: number[];
  parent_exclude?: number[];
  slug?: string;
  status?: string;
  media_type?: 'image' | 'video' | 'audio' | 'application';
  mime_type?: string;
}
