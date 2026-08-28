import { Wallet } from "lucide-react";
import { PlaceholderPage } from "@/components/vendor-dashboard/PlaceholderPage";

export default function FinancialsPage() {
  return (
    <PlaceholderPage
      title="Financials"
      icon={Wallet}
      description="Statements, payouts, and tax documents for your store. This module ships in a later release — access is granted only when the backend authorizes it."
    />
  );
}