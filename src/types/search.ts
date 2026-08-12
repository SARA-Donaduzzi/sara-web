export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult<T = any> {
  items: T[];
  total: number;
  query: string;
  filters: Record<string, any>;
  facets?: Record<string, { value: string; count: number }[]>;
}
