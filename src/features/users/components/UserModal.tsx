"use client";

import React, { useState } from "react";
import { X, User, Mail, Shield, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { AdminUser, AdminUpdateUserDto } from "../types";
import { updateUser, deleteUser } from "../api/users.api";

interface UserModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: () => void;
}

export function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<"user" | "admin">(user.role);
  const [isVerified, setIsVerified] = useState(user.isVerified ?? false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(user.hasActiveSubscription ?? false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updateUser(user._id, {
        name,
        role,
        isVerified,
        hasActiveSubscription,
      });
      onSave();
    } catch (err: any) {
      console.error("Failed to update user:", err);
      setError(err?.response?.data?.message || "Failed to save updates.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you absolutely sure you want to delete user "${user.name}"?`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteUser(user._id);
      onSave();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      setError(err?.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-violet-50 flex items-center justify-center text-[#3b338c] border border-violet-100 shrink-0">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="size-full object-cover rounded-full" />
              ) : (
                <User className="size-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Edit User Details</h3>
              <p className="text-xs text-slate-400">ID: {user._id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </header>

        {/* Content */}
        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-650 text-xs rounded-lg p-3.5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Fields */}
          <div className="space-y-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span>Full Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full px-3.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-[#3b338c] text-sm text-slate-750 font-normal transition-colors"
                placeholder="Name"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span>Email Address (Read Only)</span>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 size-4 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="h-11 w-full pl-9 pr-3.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-400 text-sm font-normal cursor-not-allowed outline-none"
                />
              </div>
            </label>
          </div>

          <hr className="border-slate-100" />

          {/* Admin Toggles & Selects */}
          <div className="space-y-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span>System Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="h-11 w-full px-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#3b338c] text-sm text-slate-750 font-normal outline-none transition-colors"
              >
                <option value="user">User / Holiday Home Guest</option>
                <option value="admin">Administrator / Operator</option>
              </select>
            </label>

            {/* Checkbox Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-[#3b338c] focus:ring-[#3b338c] accent-[#3b338c]"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-800">Verify Account</span>
                  <span className="block text-[10px] text-slate-400">Mark profile as verified</span>
                </div>
              </label>

              <label className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasActiveSubscription}
                  onChange={(e) => setHasActiveSubscription(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-[#3b338c] focus:ring-[#3b338c] accent-[#3b338c]"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-800">Active Membership</span>
                  <span className="block text-[10px] text-slate-400">Access premium status</span>
                </div>
              </label>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="h-10 px-4 bg-red-50 text-red-650 hover:bg-red-100 border border-red-200/50 font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              Delete Account
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                className="h-10 px-4 border border-slate-200 bg-white text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-5 bg-[#3b338c] text-white font-semibold rounded-lg text-xs hover:bg-violet-950 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Details
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
