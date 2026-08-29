import { api } from "@/lib/api";
import { DashboardOverviewData } from "../types/dashboard.types";

/**
 * Fetch Public Aggregated Dashboard Overview
 */
export async function fetchDashboardOverview(): Promise<DashboardOverviewData> {
  const response = await api.get("/dashboard/overview");
  return response.data?.data || response.data;
}

/**
 * Fetch Protected Admin KPI Statistics
 */
export async function fetchAdminStats(): Promise<DashboardOverviewData> {
  const response = await api.get("/dashboard/admin-stats");
  return response.data?.data || response.data;
}
