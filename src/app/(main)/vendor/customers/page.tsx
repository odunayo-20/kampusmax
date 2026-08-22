"use client";

import { useState } from "react";
import { Search, Users, Mail, Phone } from "lucide-react";
import { formatNaira, formatDate } from "@/lib/utils";
import { getVendorCustomers } from "@/services/vendor";
import { VendorCustomer } from "@/types";

export default function VendorCustomersPage() {
  const [customers] = useState<VendorCustomer[]>(getVendorCustomers);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-kampmax-text">Customers</h1>
        <p className="text-sm text-kampmax-text-secondary">
          {customers.length} customer{customers.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kampmax-text-secondary" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-kampmax-border text-sm bg-white focus:outline-none focus:border-kampmax-blue" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-kampmax-border p-8 text-center">
          <Users className="h-10 w-10 text-kampmax-text-secondary mx-auto mb-3" />
          <p className="text-sm font-medium text-kampmax-text">No customers found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl border border-kampmax-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-kampmax-navy text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-kampmax-text truncate">{customer.name}</p>
                  <p className="text-xs text-kampmax-text-secondary">{customer.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-kampmax-muted/50 rounded-lg p-2">
                  <p className="text-sm font-bold text-kampmax-text">{customer.totalOrders}</p>
                  <p className="text-[10px] text-kampmax-text-secondary">Orders</p>
                </div>
                <div className="bg-kampmax-muted/50 rounded-lg p-2">
                  <p className="text-sm font-bold text-kampmax-text">{formatNaira(customer.totalSpent)}</p>
                  <p className="text-[10px] text-kampmax-text-secondary">Total Spent</p>
                </div>
                <div className="bg-kampmax-muted/50 rounded-lg p-2">
                  <p className="text-sm font-bold text-kampmax-text">
                    {new Date(customer.lastOrderDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                  </p>
                  <p className="text-[10px] text-kampmax-text-secondary">Last Order</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <a href={`tel:${customer.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-kampmax-muted text-xs font-medium text-kampmax-text hover:bg-kampmax-muted/80 transition-colors">
                  <Phone className="h-3 w-3" /> Call
                </a>
                <a href={`mailto:${customer.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-kampmax-muted text-xs font-medium text-kampmax-text hover:bg-kampmax-muted/80 transition-colors">
                  <Mail className="h-3 w-3" /> Email
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
