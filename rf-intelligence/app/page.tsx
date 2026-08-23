import { RFNavbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { AboutRF } from "@/components/sections/AboutRF";

export default function HomePage() {
  return (
    <>
      <RFNavbar />
      <Hero />
      <AboutRF />

      {/*
        Phase 3+ sections will be added here in future phases.
        The anchor #what-is-rf is a forward-reference from the Hero's
        "Explore RF Intelligence" secondary CTA — it will resolve once
        Phase 3 (What is RF Intelligence) is built.
      */}
      <div id="what-is-rf" aria-hidden="true" />
    </>
  );
}
