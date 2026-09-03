import { redirect } from "next/navigation";

// The freelancer overview lives at /freelancer/dashboard. Redirect /freelancer
// so old links/bookmarks never 404.
export default function FreelancerIndexPage() {
  redirect("/freelancer/dashboard");
}
