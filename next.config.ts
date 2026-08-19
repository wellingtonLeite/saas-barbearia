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
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/super-admin',
        permanent: true,
      },
      {
        source: '/admin/:path*',
        destination: '/super-admin/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
