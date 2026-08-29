export interface NewsletterSubscriber {
  _id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribersListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: NewsletterSubscriber[];
  responseTime: string;
}
