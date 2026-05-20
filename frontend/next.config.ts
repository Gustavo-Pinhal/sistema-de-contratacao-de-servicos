import type { NextConfig } from "next";

const API_BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://localhost";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/ui/:path*",
        destination: `${API_BACKEND}/api/ui/:path*`,
      },
      {
        source: "/api/cadastro-usuario/:path*",
        destination: `${API_BACKEND}/api/cadastro-usuario/:path*`,
      },
      {
        source: "/api/login_check",
        destination: `${API_BACKEND}/api/login_check`,
      },
      {
        source: "/api/busca/:path*",
        destination: `${API_BACKEND}/api/busca/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;
