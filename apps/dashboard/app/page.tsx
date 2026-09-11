import { redirect } from "next/navigation";

// Root "/" — immediately redirect to login.
// No auth logic; login page navigates straight to /dashboard on submit.
export default function RootPage() {
  redirect("/login");
}
