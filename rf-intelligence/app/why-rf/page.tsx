// Why RF page — dedicated route rendering the pinned scroll experience
// (also embedded on the home page at #why-rf)
import type { Metadata } from "next";
import { RFNavbar } from "@/components/sections/Navbar";
import { WhyRF } from "@/components/sections/WhyRF";

export const metadata: Metadata = {
  title: "Why RF",
  description:
    "Traditional software records. Automation tools repeat. RF Intelligence understands, decides and executes — business first, workflow specific, human-in-the-loop.",
};

export default function WhyRFPage() {
  return (
    <>
      <RFNavbar />
      <WhyRF />
    </>
  );
}
