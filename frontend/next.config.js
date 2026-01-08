/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set the project root to avoid path resolution issues
  basePath: '',
  trailingSlash: false,
  reactStrictMode: true,
};

module.exports = nextConfig;