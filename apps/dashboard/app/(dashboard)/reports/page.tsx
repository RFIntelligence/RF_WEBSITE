import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/app/components/placeholder-page";

export default function ReportsPage() {
  return (
    <PlaceholderPage
      icon={FileText}
      eyebrow="/ reports & documents"
      heading="Reports & Documents"
      body="Generated reports, exported decks, and uploaded documents — all in one place. RF links documents to the accounts and projects they belong to."
    />
  );
}
