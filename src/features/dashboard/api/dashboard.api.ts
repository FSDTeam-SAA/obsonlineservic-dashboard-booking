import { api } from "@/lib/api";
import { unwrapData } from "@/lib/api-unwrap";
import { DashboardOverviewData } from "../types/dashboard.types";

/**
 * Fetch Public Aggregated Dashboard Overview
 */
export async function fetchDashboardOverview(): Promise<DashboardOverviewData> {
  const response = await api.get("/dashboard/overview");
  return unwrapData<DashboardOverviewData>(response.data);
}

/**
 * Fetch Protected Admin KPI Statistics
 */
export async function fetchAdminStats(): Promise<DashboardOverviewData> {
  const response = await api.get("/dashboard/admin-stats");
  return unwrapData<DashboardOverviewData>(response.data);
}
