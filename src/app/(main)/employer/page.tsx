import { redirect } from "next/navigation";

// The employer command center lives at /employer/dashboard. Redirect
// /employer so old links and bookmarks never 404 (mirrors the freelancer
// root redirect).
export default function EmployerIndexPage() {
  redirect("/employer/dashboard");
}