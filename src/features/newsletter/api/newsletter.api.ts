import { api } from "@/lib/api";
import { unwrapData } from "@/lib/api-unwrap";
import { NewsletterSubscriber } from "../types";

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const response = await api.get("/newsletter");
  const unwrapped = unwrapData<any>(response.data);
  if (Array.isArray(unwrapped)) {
    return unwrapped;
  }
  if (unwrapped && Array.isArray(unwrapped.subscribers)) {
    return unwrapped.subscribers;
  }
  if (unwrapped && Array.isArray(unwrapped.items)) {
    return unwrapped.items;
  }
  return [];
}

export async function deleteNewsletterSubscriber(id: string): Promise<{ message: string }> {
  const response = await api.delete(`/newsletter/${id}`);
  return unwrapData<{ message: string }>(response.data);
}
