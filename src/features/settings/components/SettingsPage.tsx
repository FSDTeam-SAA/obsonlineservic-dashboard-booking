"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Camera, Trash2, User, Mail, Phone, KeyRound, Globe2, ShieldCheck, Loader2, AlertTriangle, Check, UserRound } from "lucide-react";
import { getProfile, updateProfile, uploadAvatar, deleteAvatar, changePassword } from "../api/profile.api";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { SettingsSkeleton } from "./SettingsSkeleton";

export function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Status Messages
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Form Fields - Profile Info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Form Fields - Password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Regional Preferences (Mock / Local States)
  const [language, setLanguage] = useState("English (United Kingdom)");
  const [currency, setCurrency] = useState("GBP — £ British Pound");
  const [timezone, setTimezone] = useState("Europe/London (GMT+0)");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await getProfile();
        if (res.data) {
          setProfile(res.data);
          setName(res.data.name || "");
          setPhone(res.data.phone || "");
        }
      } catch (err: any) {
        console.error("Failed to load admin profile:", err);
        setProfileError("Could not load your profile details.");
      } finally {
        setLoading(false);
      }
    }
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await updateProfile({ name, phone });
      if (res.data) {
        setProfile(res.data);
        setProfileSuccess("Personal information updated successfully!");
        
        // Update local session state
        if (name !== session?.user?.name) {
          await updateSession({
            ...session,
            user: {
              ...session?.user,
              name,
            },
          });
        }
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setProfileError(err?.response?.data?.message || "Failed to update profile info.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      await changePassword({ oldPassword, newPassword });
      setPassSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password change error:", err);
      setPassError(err?.response?.data?.message || "Failed to change password. Double check current password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Image size must be less than 2MB.");
      return;
    }

    setUploadingAvatar(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await uploadAvatar(file);
      if (res.data) {
        setProfile(res.data);
        setProfileSuccess("Avatar uploaded successfully!");
        
        // Update local session avatar
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            image: res.data.profileImage,
          },
        });
      }
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setProfileError(err?.response?.data?.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!confirm("Remove profile picture?")) return;

    setUploadingAvatar(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await deleteAvatar();
      if (res.data) {
        setProfile(res.data);
        setProfileSuccess("Avatar removed successfully!");
        
        // Update local session avatar
        await updateSession({
          ...session,
          user: {
            ...session?.user,
            image: "",
          },
        });
      }
    } catch (err: any) {
      console.error("Avatar delete error:", err);
      setProfileError(err?.response?.data?.message || "Failed to remove avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <DashboardShell active="Settings" title="Settings" subtitle="Manage your account preferences and security.">
      <main className="max-w-[1040px] p-5 md:p-8 space-y-8">
        
        {loading ? (
          <SettingsSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Photo Card */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center space-y-4 shadow-sm">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-slate-250 bg-slate-100 flex items-center justify-center">
                  {profile?.profileImage ? (
                    <img src={profile.profileImage} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>

                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}

                {!uploadingAvatar && (
                  <div className="absolute -bottom-1 -right-1 flex gap-1">
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="p-1.5 bg-[#3b338c] text-white rounded-full hover:bg-violet-950 transition-colors shadow cursor-pointer"
                      title="Upload avatar"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    {profile?.profileImage && (
                      <button
                        type="button"
                        onClick={handleAvatarDelete}
                        className="p-1.5 bg-red-700 text-white rounded-full hover:bg-red-800 transition-colors shadow cursor-pointer"
                        title="Remove avatar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div className="text-center">
                <h3 className="text-base font-bold text-slate-800">{name}</h3>
                <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
              </div>

              <div className="w-full border-t border-slate-100 pt-3 text-center">
                <span className="text-[11px] text-slate-400">
                  Registered {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
            </div>

            {/* Profile Forms Column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Personal Information */}
              <form onSubmit={handleProfileSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full grid place-items-center bg-violet-50 text-[#3b338c] shrink-0">
                    <UserRound size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
                    <p className="text-xs text-slate-400">Update your profile details and contact number.</p>
                  </div>
                </div>

                {profileError && (
                  <div className="bg-red-50 border border-red-200 text-red-650 text-xs rounded-lg p-3.5 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {profileSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg p-3.5 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    <span>Email Address</span>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 size-4 text-slate-400" />
                      <input
                        type="email"
                        disabled
                        value={profile?.email || ""}
                        className="h-11 w-full pl-9 pr-3.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-400 text-sm font-normal cursor-not-allowed outline-none"
                      />
                    </div>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    <span>Phone</span>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 size-4 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 w-full pl-9 pr-3.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-[#3b338c] text-sm text-slate-750 font-normal transition-colors"
                        placeholder="Phone number"
                      />
                    </div>
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="h-10 px-5 bg-[#3b338c] text-white font-semibold rounded-lg text-xs hover:bg-violet-950 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Info
                  </button>
                </div>
              </form>

              {/* Change Password */}
              <form onSubmit={handlePasswordSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full grid place-items-center bg-violet-50 text-[#3b338c] shrink-0">
                    <KeyRound size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                    <p className="text-xs text-slate-400">Choose a strong, unique password for your account.</p>
                  </div>
                </div>

                {passError && (
                  <div className="bg-red-50 border border-red-200 text-red-650 text-xs rounded-lg p-3.5 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                {passSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg p-3.5 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    <span>Current Password</span>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="h-11 w-full px-3.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-[#3b338c] text-sm text-slate-750 font-normal transition-colors"
                      placeholder="Current Password"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    <span>New Password</span>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 w-full px-3.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-[#3b338c] text-sm text-slate-750 font-normal transition-colors"
                      placeholder="New Password"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    <span>Confirm Password</span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 w-full px-3.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-[#3b338c] text-sm text-slate-750 font-normal transition-colors"
                      placeholder="Confirm Password"
                    />
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="h-10 px-5 bg-[#3b338c] text-white font-semibold rounded-lg text-xs hover:bg-violet-950 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {changingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Update Password
                  </button>
                </div>
              </form>

              {/* Regional Preferences */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full grid place-items-center bg-violet-50 text-[#3b338c] shrink-0">
                    <Globe2 size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Regional Preferences</h2>
                    <p className="text-xs text-slate-400">Set language, currency, and time zone defaults.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    <span>Language</span>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="h-11 w-full px-3.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#3b338c] text-sm text-slate-750 font-normal outline-none"
                    >
                      <option value="English (United Kingdom)">English (United Kingdom)</option>
                      <option value="English (United States)">English (United States)</option>
                      <option value="Español">Español</option>
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    <span>Currency</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-11 w-full px-3.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#3b338c] text-sm text-slate-750 font-normal outline-none"
                    >
                      <option value="GBP — £ British Pound">GBP — £ British Pound</option>
                      <option value="USD — $ US Dollar">USD — $ US Dollar</option>
                      <option value="EUR — € Euro">EUR — € Euro</option>
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    <span>Time Zone</span>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="h-11 w-full px-3.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-[#3b338c] text-sm text-slate-750 font-normal outline-none"
                    >
                      <option value="Europe/London (GMT+0)">Europe/London (GMT+0)</option>
                      <option value="America/New_York (EST)">America/New_York (EST)</option>
                      <option value="Asia/Bangkok (GMT+7)">Asia/Bangkok (GMT+7)</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Security Footer Note */}
              <div className="p-5 border border-[#c7d2fe] rounded-2xl bg-[#eef2ff] flex items-start gap-3">
                <ShieldCheck size={20} className="text-[#3b338c] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 text-sm block">Account security</strong>
                  <p className="mt-1 text-xs text-slate-500 font-normal leading-relaxed">
                    Your settings are protected and changes are securely saved to the database. All passwords are encrypted using Bcrypt.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>
    </DashboardShell>
  );
}
