import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  transpilePackages: ["@rf-intelligence/ui", "@rf-intelligence/db"],
  serverExternalPackages: [
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "ably",
    "inngest",
  ],
};

export default withBundleAnalyzer(nextConfig);