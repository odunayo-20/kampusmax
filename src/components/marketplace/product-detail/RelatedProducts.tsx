"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  categoryId: string;
}

interface RelatedProductsProps {
  products: Product[];
  currentCategoryId: string;
}

export function RelatedProducts({ products, currentCategoryId }: RelatedProductsProps) {
  if (!products.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-neutral-900">You may also like</h2>
        <Link href={`/marketplace?category=${currentCategoryId}`} className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
          See all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/marketplace/${p.id}`}
            className="group bg-white rounded-[10px] border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-sm transition-all"
          >
            <div className="aspect-square bg-neutral-50 relative overflow-hidden">
              <Image src={p.images[0] || "/placeholder-product.svg"} alt={p.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" sizes="160px" />
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium text-neutral-900 line-clamp-1 group-hover:text-primary-600">{p.title}</p>
              <p className="text-xs font-bold text-primary-900 mt-0.5">₦{p.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}