/** @type {import('next').NextConfig} */
const BACKEND_ORIGIN = "http://51.20.18.111:8000";

const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: `${BACKEND_ORIGIN}/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
