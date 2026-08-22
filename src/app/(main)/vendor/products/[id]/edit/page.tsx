"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getVendorProductById, updateVendorProduct, deleteVendorProduct } from "@/services/vendor";
import { getCategories } from "@/services/categories";
import { getCampuses } from "@/services/campus";
import { VendorProductStatus } from "@/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const product = getVendorProductById(id);

  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [campusId, setCampusId] = useState(product?.campusId || "rugipo");
  const [condition, setCondition] = useState<"New" | "Used" | "Fair">(product?.condition || "New");
  const [stock, setStock] = useState(product?.stock?.toString() || "1");
  const [location, setLocation] = useState(product?.location || "");
  const [allowDelivery, setAllowDelivery] = useState(product?.allowDelivery ?? true);
  const [allowPickup, setAllowPickup] = useState(product?.allowPickup ?? true);
  const [deliveryFee, setDeliveryFee] = useState(product?.deliveryFee?.toString() || "");
  const [tags, setTags] = useState(product?.tags?.join(", ") || "");
  const [status, setStatus] = useState<VendorProductStatus>(product?.status || "active");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const categories = getCategories();
  const campuses = getCampuses();

  if (!product) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-kampmax-text" />
        </button>
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <p className="text-sm text-kampmax-text">Product not found</p>
        </div>
      </div>
    );
  }

  function handleSave() {
    if (!title.trim() || !price) return;
    setSaving(true);
    setTimeout(() => {
      updateVendorProduct(id, {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        categoryId,
        campusId,
        condition,
        status,
        stock: Number(stock) || 0,
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

  function handleDelete() {
    deleteVendorProduct(id);
    router.push("/vendor/products");
  }

  const isValid = title.trim() && price && Number(price) > 0;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-lg bg-kampmax-muted flex items-center justify-center">
            <ArrowLeft className="h-5 w-5 text-kampmax-text" />
          </button>
          <h1 className="text-xl font-bold text-kampmax-text">Edit Product</h1>
        </div>
        <button onClick={() => setShowDelete(true)} className="w-9 h-9 rounded-lg bg-kampmax-error/10 text-kampmax-error flex items-center justify-center">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4 space-y-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider">Basic Information</h3>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Product Name *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
        </div>
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm resize-none focus:outline-none focus:border-kampmax-blue" />
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
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
          </div>
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Original Price (₦)</label>
            <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} min={0}
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
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allowPickup} onChange={(e) => setAllowPickup(e.target.checked)}
              className="h-4 w-4 rounded border-kampmax-border text-kampmax-blue" />
            <span className="text-sm text-kampmax-text">Allow Pickup</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={allowDelivery} onChange={(e) => setAllowDelivery(e.target.checked)}
              className="h-4 w-4 rounded border-kampmax-border text-kampmax-blue" />
            <span className="text-sm text-kampmax-text">Allow Delivery</span>
          </label>
        </div>
        {allowDelivery && (
          <div>
            <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Delivery Fee (₦)</label>
            <input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="0 = Free" min={0}
              className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-kampmax-text-secondary mb-1.5">Tags</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma-separated"
            className="w-full px-3 py-2.5 rounded-lg border border-kampmax-border text-sm focus:outline-none focus:border-kampmax-blue" />
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-3">Status</h3>
        <div className="flex gap-2">
          {(["active", "draft", "archived"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={cn("flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize",
                status === s ? "bg-kampmax-navy text-white border-kampmax-navy" : "bg-white text-kampmax-text border-kampmax-border"
              )}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-kampmax-border p-4">
        <h3 className="text-xs font-semibold text-kampmax-text-secondary uppercase tracking-wider mb-3">Product Stats</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Views", value: product.viewCount },
            { label: "Saves", value: product.saveCount },
            { label: "Sold", value: product.soldCount },
            { label: "Rating", value: product.rating ? `⭐ ${product.rating}` : "N/A" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-sm font-bold text-kampmax-text">{s.value}</p>
              <p className="text-[10px] text-kampmax-text-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={!isValid || saving || saved}
        className="w-full py-3 rounded-xl bg-kampmax-blue text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
        {saving ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : saved ? <><Check className="h-4 w-4" /> Saved</> : "Save Changes"}
      </button>

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full">
            <h3 className="text-base font-bold text-kampmax-text mb-2">Delete Product?</h3>
            <p className="text-sm text-kampmax-text-secondary mb-4">
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-kampmax-border">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-kampmax-error text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
