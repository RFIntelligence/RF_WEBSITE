import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  transpilePackages: ["@rf-intelligence/ui"],
  serverExternalPackages: [
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "@prisma/client",
    "@rf-intelligence/db",
    "ably",
    "bcryptjs",
    "inngest",
  ],
};

export default nextConfig;
