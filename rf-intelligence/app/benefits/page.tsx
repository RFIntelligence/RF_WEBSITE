// Benefits page — dedicated route rendering the stacking-card benefits
// experience (also embedded on the home page at #benefits)
import type { Metadata } from "next";
import { RFNavbar } from "@/components/sections/Navbar";
import { Benefits } from "@/components/sections/Benefits";

export const metadata: Metadata = {
  title: "Benefits",
  description:
    "Seven outcomes RF Intelligence is designed to pursue — from reduced manual work to lower operational costs, stated honestly.",
};

export default function BenefitsPage() {
  return (
    <>
      <RFNavbar />
      <Benefits />
    </>
  );
}
