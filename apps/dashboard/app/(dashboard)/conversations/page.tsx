import { MessagesSquare } from "lucide-react";
import { PlaceholderPage } from "@/app/components/placeholder-page";

export default function ConversationsPage() {
  return (
    <PlaceholderPage
      icon={MessagesSquare}
      eyebrow="/ customer conversations"
      heading="Customer Conversations"
      body="Calls, emails, and meeting summaries — indexed, scored, and searchable. RF extracts the signal so nothing slips through."
    />
  );
}
