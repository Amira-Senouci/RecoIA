export type CatalogItem = {
  item_id: string;
  title: string;
  brand: string;
  category: string;
  price: number | null;
  image_url: string;
  has_image: boolean;
  avg_rating: number | null;
  n_ratings: number;
};

export type RecommendationResponse = {
  source: string;
  version: string;
  items: CatalogItem[];
};

export type AuthUser = {
  id: number;
  email: string;
  is_admin: boolean;
};

export type TokenResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterResponse = {
  email: string;
};

export type VerifyEmailResponse = {
  verified: boolean;
};

export type ForgotPasswordResponse = {
  sent: boolean;
};

export type ResetPasswordResponse = {
  reset: boolean;
};

export type ChangePasswordResponse = {
  changed: boolean;
};

export type AdminSummary = {
  total_users: number;
  total_items: number;
  total_events: number;
  events_last_7d: number;
  active_model_version: string | null;
  active_model_trained_at: string | null;
};

export type AdminUserRow = {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string | null;
  event_count: number;
};

export type AdminUsersResponse = {
  users: AdminUserRow[];
  total: number;
};

export type AdminUserDetail = {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string | null;
  recent_events: {
    id: number;
    item_id: string;
    item_title: string | null;
    event_type: string;
    ts: string | null;
  }[];
};

export type AdminAnalytics = {
  events_by_day: { day: string; count: number }[];
  events_by_type: { event_type: string; count: number }[];
  top_items: { item_id: string; title: string | null; views: number }[];
};

export type AdminModel = {
  id: number;
  version: string;
  path: string | null;
  trained_at: string | null;
  is_active: boolean;
};

export type FavoritesResponse = {
  items: CatalogItem[];
};

export type Order = {
  id: number;
  item_id: string;
  item_title: string | null;
  quantity: number;
  price: number | null;
  status: string;
  created_at: string | null;
};

export type OrdersResponse = {
  orders: Order[];
};

export type AdminOrder = Order & { user_email: string };

export type AdminOrdersResponse = {
  orders: AdminOrder[];
  total: number;
};

export type AdminNotification = {
  id: number;
  email: string;
  created_at: string | null;
};

export type NotificationsResponse = {
  notifications: AdminNotification[];
};

export type ModelMetric = {
  system: string;
  hr_at_10: number;
  ci95: number;
  ndcg_at_10: number;
  coverage: number;
  diversity: number;
  novelty: number;
};

export type ModelMetricsResponse = {
  metrics: ModelMetric[];
  best_system: string | null;
};

export type CatalogSearchParams = {
  limit?: number;
  offset?: number;
  q?: string;
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
};

export type CatalogSearchResponse = {
  items: CatalogItem[];
  total: number | null;
};

const TOKEN_KEY = "recoia_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new ApiError(response.status, detail?.detail ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  register: (email: string, password: string) =>
    request<RegisterResponse>("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  resendVerification: (email: string) =>
    request<RegisterResponse>("/api/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }),
  verifyEmail: (email: string, code: string) =>
    request<VerifyEmailResponse>("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ email, code }) }),
  login: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request<AuthUser>("/api/auth/me"),
  forgotPassword: (email: string) =>
    request<ForgotPasswordResponse>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, newPassword: string) =>
    request<ResetPasswordResponse>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<ChangePasswordResponse>("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),

  getCatalog: (limit = 24) => request<{ items: CatalogItem[] }>(`/api/catalog?limit=${limit}`),
  searchCatalog: (params: CatalogSearchParams) => {
    const usp = new URLSearchParams();
    if (params.limit) usp.set("limit", String(params.limit));
    if (params.offset) usp.set("offset", String(params.offset));
    if (params.q) usp.set("q", params.q);
    if (params.category) usp.set("category", params.category);
    if (params.brand) usp.set("brand", params.brand);
    if (params.min_price !== undefined) usp.set("min_price", String(params.min_price));
    if (params.max_price !== undefined) usp.set("max_price", String(params.max_price));
    if (params.sort) usp.set("sort", params.sort);
    return request<CatalogSearchResponse>(`/api/catalog?${usp.toString()}`);
  },
  getTrending: (limit = 12) => request<{ items: CatalogItem[] }>(`/api/catalog/trending?limit=${limit}`),
  getRecentlyViewed: (limit = 12) => request<{ items: CatalogItem[] }>(`/api/recently-viewed?limit=${limit}`),
  getItem: (itemId: string) => request<CatalogItem>(`/api/catalog/${encodeURIComponent(itemId)}`),
  getRecommendations: (limit = 12, excludeItems: string[] = [], excludeCategories: string[] = []) => {
    const params = new URLSearchParams({ limit: String(limit) });
    excludeItems.forEach((id) => params.append("exclude_item", id));
    excludeCategories.forEach((c) => params.append("exclude_category", c));
    return request<RecommendationResponse>(`/api/recommendations?${params.toString()}`);
  },
  postEvent: (itemId: string, eventType: string, value?: number) =>
    request<{ id: number }>("/api/events", {
      method: "POST",
      body: JSON.stringify({ item_id: itemId, event_type: eventType, value }),
    }),

  getFavorites: () => request<FavoritesResponse>("/api/favorites"),
  addFavorite: (itemId: string) =>
    request<{ favorited: boolean }>(`/api/favorites/${encodeURIComponent(itemId)}`, { method: "POST" }),
  removeFavorite: (itemId: string) =>
    request<{ favorited: boolean }>(`/api/favorites/${encodeURIComponent(itemId)}`, { method: "DELETE" }),

  createOrder: (itemId: string, quantity = 1) =>
    request<Order>("/api/orders", { method: "POST", body: JSON.stringify({ item_id: itemId, quantity }) }),
  getOrders: () => request<OrdersResponse>("/api/orders"),

  getPreferences: () => request<{ category_prefs: string[] }>("/api/profile/preferences"),
  updatePreferences: (categoryPrefs: string[]) =>
    request<{ category_prefs: string[] }>("/api/profile/preferences", {
      method: "PUT",
      body: JSON.stringify({ category_prefs: categoryPrefs }),
    }),

  getAdminSummary: () => request<AdminSummary>("/api/admin/summary"),
  getAdminUsers: (page = 1, pageSize = 20) =>
    request<AdminUsersResponse>(`/api/admin/users?page=${page}&page_size=${pageSize}`),
  getAdminUserDetail: (userId: number) => request<AdminUserDetail>(`/api/admin/users/${userId}`),
  getAdminAnalytics: () => request<AdminAnalytics>("/api/admin/analytics"),
  getAdminModels: () => request<{ models: AdminModel[] }>("/api/admin/models"),
  getAdminModelMetrics: () => request<ModelMetricsResponse>("/api/admin/model-metrics"),
  getAdminOrders: (page = 1, pageSize = 20) =>
    request<AdminOrdersResponse>(`/api/admin/orders?page=${page}&page_size=${pageSize}`),
  getAdminNotifications: () => request<NotificationsResponse>("/api/admin/notifications"),
};
