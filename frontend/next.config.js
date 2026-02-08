/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set the project root to avoid path resolution issues
  basePath: '',
  trailingSlash: false,
  reactStrictMode: true,
  // Ensure proper handling of API calls
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:8000'}/:path*`,
      },
      // Additional rewrite to handle direct API calls if needed
      {
        source: '/api/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:8000'}/auth/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
