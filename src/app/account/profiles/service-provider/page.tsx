import { redirect } from "next/navigation";

// Legacy route: the service-provider profile center moved to the dashboard at
// /service-provider. Redirect so bookmarks/old links never 404.
export default function AccountProfilesServiceProviderPage() {
  redirect("/service-provider");
}