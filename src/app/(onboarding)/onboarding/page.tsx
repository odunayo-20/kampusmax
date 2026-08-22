"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Users, MessageCircle, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const slides = [
  {
    icon: Store,
    title: "Buy & Sell on Campus",
    description:
      "Browse thousands of products from verified students and vendors on your campus. From textbooks to gadgets.",
    color: "text-kampmax-blue",
  },
  {
    icon: Users,
    title: "Campus Community",
    description:
      "Join your campus feed. Ask questions, share tips, find lost items, and stay updated on campus events.",
    color: "text-kampmax-gold",
  },
  {
    icon: MessageCircle,
    title: "Chat & Connect",
    description:
      "Message sellers directly, negotiate prices, and arrange campus pickups. Fast and easy communication.",
    color: "text-kampmax-blue",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const isLastSlide = currentSlide === slides.length - 1;

  function handleNext() {
    if (isLastSlide) {
      router.push("/onboarding/campus");
    } else {
      setCurrentSlide((s) => s + 1);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-10">
            <div
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center",
                currentSlide === 1 ? "bg-kampmax-gold/10" : "bg-kampmax-blue/10"
              )}
            >
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon className={cn("h-10 w-10", slides[currentSlide].color)} />;
              })()}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-kampmax-text text-center mb-3">
            {slides[currentSlide].title}
          </h1>
          <p className="text-sm text-kampmax-text-secondary text-center leading-relaxed mb-10">
            {slides[currentSlide].description}
          </p>

          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentSlide
                    ? "w-8 bg-kampmax-blue"
                    : "w-1.5 bg-kampmax-border"
                )}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isLastSlide ? "Get Started" : "Next"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          {!isLastSlide && (
            <button
              onClick={() => router.push("/onboarding/campus")}
              className="w-full mt-3 text-sm text-kampmax-text-secondary text-center py-2 hover:text-kampmax-text transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-kampmax-text-secondary">
          Kampmax — Your Campus Marketplace
        </p>
      </div>
    </div>
  );
}
