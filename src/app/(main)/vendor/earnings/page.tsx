import { TrendingUp } from "lucide-react";
import { PlaceholderPage } from "@/components/vendor-dashboard/PlaceholderPage";

export default function EarningsPage() {
  return (
    <PlaceholderPage
      title="Earnings"
      icon={TrendingUp}
      description="Revenue summaries, payouts, and statements for your store. This module ships in a later release — financial data is only shown when the backend authorizes it."
    />
  );
}