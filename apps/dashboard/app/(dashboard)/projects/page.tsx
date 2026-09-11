import { FolderKanban } from "lucide-react";
import { PlaceholderPage } from "@/app/components/placeholder-page";

export default function ProjectsPage() {
  return (
    <PlaceholderPage
      icon={FolderKanban}
      eyebrow="/ projects"
      heading="Projects"
      body="Track milestones, owners, and delivery status across all active engagements."
    />
  );
}
