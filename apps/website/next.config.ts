import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Enables the styled-components SWC transform for consistent class names
    // between server and client, avoiding hydration mismatches.
    styledComponents: true,
  },
};

export default nextConfig;
