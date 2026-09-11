import { MessageCircleQuestion } from "lucide-react";
import { PlaceholderPage } from "@/app/components/placeholder-page";

export default function AskRFPage() {
  return (
    <PlaceholderPage
      icon={MessageCircleQuestion}
      eyebrow="/ ask rf"
      heading="Ask RF"
      body="Ask RF anything about your pipeline, customers, or business. Natural language queries against your connected data."
    />
  );
}
