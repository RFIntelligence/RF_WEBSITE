import { MessageSquare } from "lucide-react";
import { PlaceholderPage } from "@/app/components/placeholder-page";

export default function MessagesPage() {
  return (
    <PlaceholderPage
      icon={MessageSquare}
      eyebrow="/ messages"
      heading="Messages"
      body="Internal team messages and threaded discussions — contextual to accounts, projects, and insights."
    />
  );
}
