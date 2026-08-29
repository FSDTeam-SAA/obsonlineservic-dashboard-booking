"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const routes: Record<string, string> = {
  Dashboard: "/dashboard",
  Properties: "/dashboard/properties",
  "Holiday Parks": "/dashboard/holiday-parks",
  Bookings: "/dashboard/bookings",
  Offers: "/dashboard/offers",
  "Create Offer": "/dashboard/offers/create",
  Reviews: "/dashboard/reviews",
  Users: "/dashboard/users",
  Settings: "/dashboard/settings",
  "Add Holiday Park": "/dashboard/properties/add",
  Newsletter: "/dashboard/newsletter",
};

export function SidebarNavigationController() {
  const router = useRouter();

  useEffect(() => {
    const handleNavigation = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button.nav-item, button.add-park, button.create-offer");
      const route = button ? routes[button.textContent?.trim() ?? ""] : undefined;

      if (route) router.push(route);
    };

    document.addEventListener("click", handleNavigation);
    return () => document.removeEventListener("click", handleNavigation);
  }, [router]);

  return null;
}
