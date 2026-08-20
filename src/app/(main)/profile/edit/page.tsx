"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { Avatar } from "@/components/atoms/Avatar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsGroup, SettingsRow, SettingsToggle } from "@/components/profile/SettingsGroup";
import { getCurrentUser } from "@/services/users";
import { useApp } from "@/lib/app-context";
import { campuses } from "@/data/campus";

export default function EditProfilePage() {
  const router = useRouter();
  const { selectedCampus } = useApp();
  const user = getCurrentUser();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [bio, setBio] = useState(user.bio);
  const [department, setDepartment] = useState(user.department || "");
  const [level, setLevel] = useState(user.level || "");
  const [campusId, setCampusId] = useState(user.campusId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const campus = campuses.find((c) => c.id === campusId) || selectedCampus;
  const departments = campus.departments;
  const levels = ["ND1", "ND2", "HND1", "HND2", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  }

  return (
    <PageContainer className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Profile", href: "/profile" },
          { label: "Edit Profile" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <h1 className="text-lg font-bold text-kampmax-text">Edit Profile</h1>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-kampmax-border p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar name={name} size="lg" className="h-20 w-20 text-2xl" />
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-kampmax-blue text-white flex items-center justify-center ring-2 ring-white">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-kampmax-text-secondary">
            Tap to change profile photo
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <SettingsGroup title="Personal Information">
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text resize-none focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
              placeholder="Tell people about yourself..."
            />
            <p className="text-[11px] text-kampmax-text-secondary text-right mt-1">
              {bio.length}/160
            </p>
          </div>
        </div>
      </SettingsGroup>

      {/* Campus Information */}
      <SettingsGroup title="Campus Information">
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
              Campus
            </label>
            <select
              value={campusId}
              onChange={(e) => {
                setCampusId(e.target.value);
                setDepartment("");
              }}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text bg-white focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.abbreviation})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text bg-white focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm text-kampmax-text bg-white focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20"
            >
              <option value="">Select level</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SettingsGroup>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className="w-full py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-kampmax-blue/90 active:bg-kampmax-blue/80 transition-colors disabled:opacity-60"
      >
        {saving ? (
          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : saved ? (
          <>
            <Check className="h-4 w-4" />
            Saved
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </PageContainer>
  );
}
