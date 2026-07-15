export type Response<T> = {
  page: number;
  limit: number;
  total: number;
  data: T[];
};
export function unwrapList<T>(payload: T[] | Response<T> | undefined | null): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}
