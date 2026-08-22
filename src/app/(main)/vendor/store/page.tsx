"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Clock, RotateCcw, Check } from "lucide-react";
import { getStoreProfile, updateStoreProfile } from "@/services/vendor";
import { getCampuses } from "@/services/campus";
import { StoreProfile } from "@/types";

export default function StoreProfilePage() {
  const router = useRouter();
  const profile = getStoreProfile();
  const campuses = getCampuses();

  const [storeName, setStoreName] = useState(profile.storeName);
  const [description, setDescription] = useState(profile.description);
  const [specialties, setSpecialties] = useState(profile.specialties.join(", "));
  const [responseTime, setResponseTime] = useState(profile.responseTime);
  const [operatingHours, setOperatingHours] = useState(profile.operatingHours);
  const [returnPolicy, setReturnPolicy] = useState(profile.returnPolicy);
  const [campusId, setCampusId] = useState(profile.campusId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      updateStoreProfile({
        storeName: storeName.trim(),
        description: description.trim(),
        specialties: specialties.split(",").map((s) => s.trim()).filter(Boolean),
        responseTime: responseTime.trim(),
        operatingHours: operatingHours.trim(),
        returnPolicy: returnPolicy.trim(),
        campusId,
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <h1 className="text-xl font-bold text-kampmax-text">Store Profile</h1>
      </div>

      {/* Cover Image */}
      <div className="bg-white rounded-xl border border-kampmax-border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-kampmax-navy to-kampmax-blue relative">
          <button className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 pb-4 -mt-6">
          <div className="w-14 h-14 rounded-xl bg-kampmax-gold flex items-center justify-center text-kampmax-navy text-lg font-bold ring-4 ring-white">
            {storeName.charAt(0)}
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4 space-y-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider">Store Information</h3>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Store Name</label>
          <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
        </div>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm resize-none focus:outline-none focus:border-kampmax-blue" />
        </div>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Campus</label>
          <select value={campusId} onChange={(e) => setCampusId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue">
            {campuses.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Specialties (comma-separated)</label>
          <input type="text" value={specialties} onChange={(e) => setSpecialties(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
        </div>
      </div>

      {/* Policies */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4 space-y-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider">Policies & Hours</h3>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Operating Hours</span>
          </label>
          <input type="text" value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
        </div>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Response Time</span>
          </label>
          <input type="text" value={responseTime} onChange={(e) => setResponseTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
        </div>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">
            <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Return Policy</span>
          </label>
          <textarea value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm resize-none focus:outline-none focus:border-kampmax-blue" />
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
        {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : saved ? <><Check className="h-4 w-4" /> Saved</> : "Save Store Profile"}
      </button>
    </div>
  );
}
