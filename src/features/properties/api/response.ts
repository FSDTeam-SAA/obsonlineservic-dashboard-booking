export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

function isApiEnvelope<T>(payload: ApiEnvelope<T> | T): payload is ApiEnvelope<T> {
  return typeof payload === "object" && payload !== null && "success" in payload && "data" in payload;
}

export function unwrapApiResponse<T>(payload: ApiEnvelope<T> | T): T {
  return isApiEnvelope(payload) ? payload.data : payload;
}
