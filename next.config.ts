import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/games-emglish-ppt',
  assetPrefix: '/games-emglish-ppt',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
