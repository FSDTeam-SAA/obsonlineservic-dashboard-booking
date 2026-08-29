import { SubscribersPage } from "@/features/newsletter/components/SubscribersPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter Subscribers | OBS Admin",
  description: "View and manage newsletter subscribers.",
};

export default function Page() {
  return <SubscribersPage />;
}
