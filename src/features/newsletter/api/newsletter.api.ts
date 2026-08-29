import { api } from "@/lib/api";
import { SubscribersListResponse } from "../types";

export async function getNewsletterSubscribers(): Promise<SubscribersListResponse> {
  const response = await api.get<SubscribersListResponse>("/newsletter");
  return response.data;
}
