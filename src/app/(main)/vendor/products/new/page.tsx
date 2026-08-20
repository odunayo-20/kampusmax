"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { addVendorProduct } from "@/services/vendor";
import { getCategories } from "@/services/categories";
import { getCampuses } from "@/services/campus";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import { getVendorByUserId } from "@/services/users";
import { VendorProductStatus } from "@/types";

export default function AddProductPage() {
  const router = useRouter();
  const { selectedCampus } = useApp();
  const { user } = useAuth();
  const vendor = user ? getVendorByUserId(user.id) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [campusId, setCampusId] = useState(selectedCampus.id);
  const [condition, setCondition] = useState<"New" | "Used" | "Fair">("New");
  const [stock, setStock] = useState("1");
  const [location, setLocation] = useState("");
  const [allowDelivery, setAllowDelivery] = useState(true);
  const [allowPickup, setAllowPickup] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<VendorProductStatus>("active");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const categories = getCategories();
  const campuses = getCampuses();

  function handleSave() {
    if (!title.trim() || !price || !categoryId || !vendor) return;
    setSaving(true);
    setTimeout(() => {
      addVendorProduct({
        vendorId: vendor.id,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        categoryId,
        campusId,
        images: ["/placeholder-product.svg"],
        condition,
        status,
        stock: Number(stock) || 1,
        allowDelivery,
        allowPickup,
        deliveryFee: deliveryFee ? Number(deliveryFee) : undefined,
        location: location.trim() || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()) : undefined,
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/vendor/products"), 800);
    }, 500);
  }

  const isValid = title.trim() && price && Number(price) > 0 && categoryId;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <h1 className="text-xl font-bold text-kampmax-text">Add New Product</h1>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <label className="block text-xs font-semibold text-kampmax-text-secondary mb-3">Product Images</label>
        <div className="grid grid-cols-4 gap-2">
          <button className="aspect-square rounded-lg border-2 border-dashed border-kampmax-border flex flex-col items-center justify-center gap-1 hover:border-kampmax-blue transition-colors">
            <Upload className="h-5 w-5 text-kampmax-text-secondary" />
            <span className="text-[10px] text-kampmax-text-secondary">Add Photo</span>
          </button>
        </div>
        <p className="text-[11px] text-kampmax-text-secondary mt-2">Mock: image upload placeholder. Add up to 5 photos.</p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4 space-y-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider">Basic Information</h3>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Product Name *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. HP Laptop i5 8GB RAM"
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20" />
        </div>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your product..."
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm resize-none focus:outline-none focus:border-kampmax-blue focus:ring-1 focus:ring-kampmax-blue/20" />
        </div>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Category *</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue">
            <option value="">Select category</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4 space-y-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider">Pricing & Stock</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Price (₦) *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" min={0}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
          </div>
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Original Price (₦)</label>
            <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="Optional" min={0}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Stock *</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} min={0}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
          </div>
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Condition</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value as "New" | "Used" | "Fair")}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue">
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Fair">Fair</option>
            </select>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4 space-y-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider">Delivery & Location</h3>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Campus</label>
          <select value={campusId} onChange={(e) => setCampusId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue">
            {campuses.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Pickup Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main Gate, Engineering Block"
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allowPickup} onChange={(e) => setAllowPickup(e.target.checked)}
              className="h-4 w-4 rounded border-kampmax-border text-kampmax-blue focus:ring-kampmax-blue/20" />
            <span className="text-sm text-kampmax-text">Allow Pickup</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allowDelivery} onChange={(e) => setAllowDelivery(e.target.checked)}
              className="h-4 w-4 rounded border-kampmax-border text-kampmax-blue focus:ring-kampmax-blue/20" />
            <span className="text-sm text-kampmax-text">Allow Delivery</span>
          </label>
        </div>
        {allowDelivery && (
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Delivery Fee (₦)</label>
            <input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="0 = Free delivery" min={0}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Tags (comma-separated)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. laptop, hp, electronics"
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-3">Listing Status</h3>
        <div className="flex gap-2">
          {(["active", "draft"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={cn("flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors",
                status === s ? "bg-kampmax-navy text-white border-kampmax-navy" : "bg-white text-kampmax-text border-kampmax-border"
              )}>
              {s === "active" ? "Publish Now" : "Save as Draft"}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={!isValid || saving || saved}
        className="w-full py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
        {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : saved ? <><Check className="h-4 w-4" /> Product Added</>
            : "Add Product"}
      </button>
    </div>
  );
}
