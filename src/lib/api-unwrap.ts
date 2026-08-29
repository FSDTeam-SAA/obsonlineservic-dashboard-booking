/**
 * Central utility to safely unwrap NestJS API envelopes.
 * NestJS backend uses ResponseInterceptor:
 * { statusCode: 200, success: true, message: "...", meta?: { total, page, limit, totalPages }, data: T }
 */

export interface ApiEnvelope<T = any> {
  statusCode?: number;
  success?: boolean;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: T;
}

export function unwrapData<T>(payload: any): T {
  if (payload && typeof payload === "object") {
    if ("data" in payload && payload.data !== undefined) {
      const data = payload.data;
      // If data is paginated object with items, but top-level meta exists, attach top-level meta if missing
      if (data && typeof data === "object" && !Array.isArray(data)) {
        if (payload.meta && !data.meta) {
          return { ...data, meta: payload.meta };
        }
      }
      return data;
    }
  }
  return payload as T;
}

export function unwrapPaginated<T>(payload: any): { items: T[]; meta?: { total: number; page: number; limit: number; totalPages: number } } {
  const unwrapped = unwrapData<any>(payload);

  let items: T[] = [];
  let meta = payload?.meta || unwrapped?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  if (Array.isArray(unwrapped)) {
    items = unwrapped;
    meta = payload?.meta || { total: items.length, page: 1, limit: items.length || 10, totalPages: 1 };
  } else if (unwrapped && typeof unwrapped === "object") {
    if (Array.isArray(unwrapped.items)) {
      items = unwrapped.items;
    } else if (Array.isArray(unwrapped.users)) {
      items = unwrapped.users;
    } else if (Array.isArray(unwrapped.subscribers)) {
      items = unwrapped.subscribers;
    }
    if (unwrapped.meta) {
      meta = unwrapped.meta;
    } else if (unwrapped.paginationInfo) {
      meta = {
        total: unwrapped.paginationInfo.total || items.length,
        page: unwrapped.paginationInfo.page || 1,
        limit: unwrapped.paginationInfo.limit || 10,
        totalPages: unwrapped.paginationInfo.pages || unwrapped.paginationInfo.totalPages || 1,
      };
    }
  }

  return { items, meta };
}
