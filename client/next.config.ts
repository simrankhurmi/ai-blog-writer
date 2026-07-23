import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // shadcn/ui includes optional components with incomplete peer deps
    ignoreBuildErrors: true,
  },
  devIndicators: false,
};

export default nextConfig;
