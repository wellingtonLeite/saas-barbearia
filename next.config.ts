import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/.well-known/oauth-authorization-server',
        destination: '/api/well-known-oauth',
      },
    ];
  },
};

export default nextConfig;
