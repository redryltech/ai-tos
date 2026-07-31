/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint/typecheck run as separate turbo tasks; don't block the production build on lint.
  eslint: { ignoreDuringBuilds: true },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  },
};

export default nextConfig;
