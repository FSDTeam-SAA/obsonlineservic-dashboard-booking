/* eslint-disable no-restricted-globals */
import { NewsletterSubscriber } from "../types";

self.onmessage = (event: MessageEvent<{
  subscribers: NewsletterSubscriber[];
  search: string;
  status: string;
}>) => {
  const { subscribers, search, status } = event.data;
  
  let filtered = [...subscribers];
  
  // 1. Search Filter
  if (search.trim()) {
    const query = search.toLowerCase().trim();
    filtered = filtered.filter(sub => sub.email.toLowerCase().includes(query));
  }
  
  // 2. Status Filter
  if (status !== "All") {
    const isActive = status === "Active";
    filtered = filtered.filter(sub => sub.isActive === isActive);
  }
  
  // 3. Sort (Newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  self.postMessage(filtered);
};
