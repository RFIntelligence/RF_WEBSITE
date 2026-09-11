import { Users } from "lucide-react";
import { PlaceholderPage } from "@/app/components/placeholder-page";

export default function TeamPage() {
  return (
    <PlaceholderPage
      icon={Users}
      eyebrow="/ team & account"
      heading="Team & Account"
      body="Manage team members, roles, and organisation settings. Connect integrations and configure RF for your workspace."
    />
  );
}
