import { Wallet } from "lucide-react";
import { PlaceholderPage } from "@/components/vendor-dashboard/PlaceholderPage";

export default function WalletPage() {
  return (
    <PlaceholderPage
      title="Wallet"
      icon={Wallet}
      description="Your vendor wallet, payouts, and transactions. This module ships in a later release — financial data is only shown when the backend authorizes it."
    />
  );
}