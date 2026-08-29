import { UsersPage } from "@/features/users/components/UsersPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "User Management | OBS Admin",
  description: "Manage registered customers, admins, and permissions.",
};

export default function Page() {
  return <UsersPage />;
}
