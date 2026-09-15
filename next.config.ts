import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/products", destination: "/collection", permanent: false },
      { source: "/products/:path*", destination: "/collection", permanent: false },
      { source: "/contact", destination: "/consultation", permanent: false },
    ];
  },
};

export default nextConfig;
