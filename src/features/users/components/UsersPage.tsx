"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAllUsers, getAllAdmins } from "../api/users.api";
import { AdminUser, GetUsersQueryDto } from "../types";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { UsersSkeleton } from "./UsersSkeleton";
import { UserModal } from "./UserModal";
import { Search, ChevronLeft, ChevronRight, User, Settings, CheckCircle2, XCircle, ShieldAlert, BadgeInfo, Users, ShieldCheck, UserCheck, RefreshCw } from "lucide-react";

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and Query states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Stats
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);

  // Edit modal state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const query: GetUsersQueryDto = {
        page,
        limit: 10,
        search: search || undefined,
      };

      const res = roleFilter === "admin" ? await getAllAdmins(query) : await getAllUsers(query);
      if (res.data) {
        const list = res.data.users || [];
        setUsers(list);
        if (res.data.paginationInfo) {
          setTotalPages(res.data.paginationInfo.pages || 1);
          setTotalCount(res.data.paginationInfo.total || list.length);
        }
        
        // Calculate quick stat counts
        setVerifiedCount(list.filter((u) => u.isVerified).length);
        setAdminCount(list.filter((u) => u.role === "admin").length);
      }
    } catch (err: any) {
      console.error("Failed to fetch users list:", err);
      setError(err?.response?.data?.message || "Could not retrieve user directory.");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleModalSave = () => {
    setSelectedUser(null);
    fetchUsers();
  };

  return (
    <DashboardShell active="Users" title="User Management" subtitle="Manage registered customers, operators, and permissions.">
      <main className="max-w-[1040px] p-5 md:p-8 space-y-6 font-sans">
        
        {/* KPI Stats Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-violet-50 text-[#3b338c] flex items-center justify-center shrink-0 border border-violet-100">
              <Users className="size-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Directory</span>
              <strong className="text-xl font-bold text-slate-900 block leading-tight">{totalCount}</strong>
              <span className="text-[10px] text-slate-500 font-medium">Registered User Accounts</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0 border border-green-100">
              <UserCheck className="size-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified Profiles</span>
              <strong className="text-xl font-bold text-green-700 block leading-tight">{verifiedCount}</strong>
              <span className="text-[10px] text-slate-500 font-medium">Verified Identity Records</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="size-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
              <ShieldCheck className="size-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin Privileges</span>
              <strong className="text-xl font-bold text-purple-800 block leading-tight">{adminCount}</strong>
              <span className="text-[10px] text-slate-500 font-medium">Operator Roles</span>
            </div>
          </div>
        </section>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl p-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button onClick={fetchUsers} className="text-xs font-semibold text-red-700 hover:underline cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* Directory Bar with Tab Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-slate-400 focus-within:bg-white focus-within:border-[#3b338c] transition-all">
              <Search size={15} />
              <input
                value={search}
                onChange={handleSearchChange}
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400 text-slate-700 font-normal"
                placeholder="Search users by name, email..."
              />
            </label>

            {/* Role Filter Tabs */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setRoleFilter("all");
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  roleFilter === "all"
                    ? "bg-white text-[#3b338c] shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All Users
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoleFilter("admin");
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  roleFilter === "admin"
                    ? "bg-white text-[#3b338c] shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Admins Only
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400 font-normal">
            <span>Showing <strong className="text-slate-700">{users.length}</strong> of <strong className="text-slate-700">{totalCount}</strong></span>
            <button
              onClick={fetchUsers}
              className="p-2 text-slate-400 hover:text-[#3b338c] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title="Refresh directory"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </div>

        {/* Users Table / List */}
        {loading ? (
          <UsersSkeleton />
        ) : users.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-3">
            <BadgeInfo className="w-10 h-10 text-slate-350 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No users found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              We couldn't find any users matching your query parameters. Try refining your search.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Verified</th>
                    <th className="py-4 px-6">Subscription</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-750">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name Card */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="size-8.5 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                            {u.profileImage ? (
                              <img src={u.profileImage} alt={u.name} className="size-full object-cover" />
                            ) : (
                              <User className="size-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block leading-tight">{u.name}</span>
                            <span className="text-[10px] text-slate-400 block pt-0.5">
                              Joined {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-6 text-slate-500">{u.email}</td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          u.role === "admin" ? "bg-violet-50 text-violet-750 border border-violet-200" : "bg-slate-100 text-slate-650"
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Verified Toggle */}
                      <td className="py-3.5 px-6">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700">
                            <CheckCircle2 className="size-3.5 text-green-600" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                            <XCircle className="size-3.5 text-slate-300" /> No
                          </span>
                        )}
                      </td>

                      {/* Active Subscription Badge */}
                      <td className="py-3.5 px-6">
                        {u.hasActiveSubscription ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wider">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-105 bg-slate-100 text-slate-400 border border-slate-150 uppercase tracking-wider">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors inline-flex items-center justify-center cursor-pointer shadow-sm"
                          title="Manage user details"
                        >
                          <Settings className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <footer className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] text-slate-550 font-normal">
                  Page <strong className="text-slate-750">{page}</strong> of <strong className="text-slate-750">{totalPages}</strong>
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="h-8 px-3 border border-slate-200 bg-white text-slate-650 rounded-lg text-[10px] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <ChevronLeft className="size-3.5" /> Previous
                  </button>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="h-8 px-3 border border-slate-200 bg-white text-slate-650 rounded-lg text-[10px] font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    Next <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </footer>
            )}
          </div>
        )}

      </main>

      {/* Edit User Modal Overlay */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleModalSave}
        />
      )}
    </DashboardShell>
  );
}
