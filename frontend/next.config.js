/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set the project root to avoid path resolution issues
  basePath: '',
  trailingSlash: false,
  reactStrictMode: true,
  // Ensure proper handling of API calls
  async rewrites() {
    // Generic rewrite to proxy all /api/* requests to the backend
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || process.env.BACKEND_URL || 'http://localhost:8000'}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
