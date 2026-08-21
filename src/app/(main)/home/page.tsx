"use client";

import Link from "next/link";
import {
  Search, TrendingUp, Star, Clock, Flame, Users, Zap,
  Calendar, ShoppingBag, Wallet, MessageCircle, BookOpen,
  MapPin, ChevronRight
} from "lucide-react";
import { ProductCard, CategoryCard } from "@/components/marketplace";
import { Button } from "@/components/ui";
import { PageContainer, SectionHeader, HorizontalScroll } from "@/components/layout";
import {
  VendorCard, EventCard, QuickAction, EmptyState,
  CampusHighlightCard, ProductCardHorizontal
} from "@/components/home";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import {
  getFeaturedProductsByCampus,
  getPopularProductsByCampus,
  getRecentProductsByCampus,
  getRecommendedProductsByCampus,
} from "@/services/products";
import { getCategories } from "@/services/categories";
import { getTopVendorsByCampus } from "@/services/users";
import { getUpcomingEvents } from "@/services/events";
import { getCampusPosts } from "@/services/posts";
import { getUnreadNotificationCount } from "@/services/notifications";
import { getTotalUnreadCount } from "@/services/messages";
import { useCart } from "@/lib/cart-context";

export default function HomePage() {
  const { selectedCampus } = useApp();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const campusId = selectedCampus.id;

  const featured = getFeaturedProductsByCampus(campusId).slice(0, 6);
  const popular = getPopularProductsByCampus(campusId).slice(0, 8);
  const recent = getRecentProductsByCampus(campusId).slice(0, 8);
  const recommended = getRecommendedProductsByCampus(campusId).slice(0, 8);
  const categories = getCategories();
  const vendors = getTopVendorsByCampus(campusId);
  const events = getUpcomingEvents(campusId).slice(0, 4);
  const posts = getCampusPosts(campusId).slice(0, 6);
  const unreadNotifs = user ? getUnreadNotificationCount(user.id) : 0;
  const unreadMessages = user ? getTotalUnreadCount(user.id) : 0;

  const greeting = getGreeting();

  return (
    <PageContainer className="space-y-7">
      {/* 1. Campus Greeting */}
      <section>
        <p className="text-sm text-kampmax-text-secondary">{greeting}, {user?.name?.split(" ")[0] || "Student"}</p>
        <h1 className="text-xl font-bold text-kampmax-text">
          {selectedCampus.abbreviation} Marketplace
        </h1>
        <p className="text-xs text-kampmax-text-secondary mt-0.5">
          {selectedCampus.location}
        </p>
      </section>

      {/* 2. Search */}
      <section>
        <Link href="/marketplace">
          <div className="flex items-center gap-3 h-11 pl-3 pr-4 bg-white border border-kampmax-border rounded-lg text-kampmax-text-secondary text-sm hover:border-kampmax-blue/50 transition-colors">
            <Search className="h-4 w-4" />
            <span>Search products, vendors, food...</span>
          </div>
        </Link>
      </section>

      {/* 3. Quick Actions */}
      <section>
        <div className="grid grid-cols-4 gap-2">
          <QuickAction
            href="/marketplace"
            icon={<ShoppingBag className="h-5 w-5" />}
            label="Buy"
          />
          <QuickAction
            href="/marketplace?sell=true"
            icon={<Zap className="h-5 w-5" />}
            label="Sell"
          />
          <QuickAction
            href="/wallet"
            icon={<Wallet className="h-5 w-5" />}
            label="Wallet"
          />
          <QuickAction
            href="/chat"
            icon={<MessageCircle className="h-5 w-5" />}
            label="Chat"
            badge={unreadMessages}
          />
        </div>
      </section>

      {/* 4. Categories */}
      <section>
        <SectionHeader
          title="Categories"
          action={{ label: "See all", href: "/marketplace" }}
        />
        <div className="grid grid-cols-4 gap-2">
          {categories.slice(0, 8).map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 5. Deals & Discounts */}
      {featured.length > 0 && (
        <section>
          <SectionHeader
            title="Deals & Discounts"
            subtitle="Campus-specific offers"
            icon={<TrendingUp className="h-4 w-4 text-kampmax-gold" />}
            action={{ label: "View all", href: "/marketplace" }}
          />
          <HorizontalScroll>
            {featured.map((product) => (
              <ProductCardHorizontal key={product.id} product={product} />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* 6. Popular Products */}
      {popular.length > 0 && (
        <section>
          <SectionHeader
            title="Popular on Campus"
            subtitle="Most viewed at your school"
            icon={<Flame className="h-4 w-4 text-kampmax-error" />}
            action={{ label: "View all", href: "/marketplace" }}
          />
          <HorizontalScroll>
            {popular.map((product) => (
              <ProductCardHorizontal key={product.id} product={product} />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* 7. Nearby Vendors */}
      {vendors.length > 0 && (
        <section>
          <SectionHeader
            title="Campus Vendors"
            subtitle={`Shops at ${selectedCampus.abbreviation}`}
            icon={<Store className="h-4 w-4 text-kampmax-blue" />}
            action={{ label: "View all", href: "/marketplace" }}
          />
          <HorizontalScroll>
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* 8. Recently Added */}
      {recent.length > 0 && (
        <section>
          <SectionHeader
            title="Just Listed"
            subtitle="Fresh from campus sellers"
            icon={<Clock className="h-4 w-4 text-kampmax-text-secondary" />}
            action={{ label: "View all", href: "/marketplace" }}
          />
          <HorizontalScroll>
            {recent.map((product) => (
              <ProductCardHorizontal key={product.id} product={product} />
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* 9. Recommended */}
      {recommended.length > 0 && (
        <section>
          <SectionHeader
            title="Recommended for You"
            subtitle="Based on campus activity"
            icon={<Star className="h-4 w-4 text-kampmax-gold" />}
            action={{ label: "View all", href: "/marketplace" }}
          />
          <div className="grid grid-cols-2 gap-3">
            {recommended.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 10. Campus & Community Highlights */}
      <section>
        <SectionHeader
          title="Campus Highlights"
          subtitle={`From ${selectedCampus.abbreviation} community`}
          icon={<Users className="h-4 w-4 text-kampmax-blue" />}
          action={{ label: "View all", href: "/community" }}
        />
        {posts.length > 0 ? (
          <HorizontalScroll>
            {posts.map((post) => (
              <CampusHighlightCard key={post.id} post={post} />
            ))}
          </HorizontalScroll>
        ) : (
          <EmptyState
            icon={<MessageCircle className="h-6 w-6" />}
            title="No community posts yet"
            description="Be the first to share something with your campus community"
            action={
              <Link href="/community">
                <Button variant="outline" size="sm">Go to Community Feed</Button>
              </Link>
            }
          />
        )}
      </section>

      {/* 11. Upcoming Events */}
      {events.length > 0 && (
        <section>
          <SectionHeader
            title="Upcoming Events"
            subtitle={`At ${selectedCampus.abbreviation}`}
            icon={<Calendar className="h-4 w-4 text-kampmax-success" />}
            action={{ label: "View all", href: "/community" }}
          />
          <HorizontalScroll>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </HorizontalScroll>
        </section>
      )}
    </PageContainer>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Store(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
    </svg>
  );
}
