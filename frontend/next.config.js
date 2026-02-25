/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set the project root to avoid path resolution issues
  basePath: '',
  trailingSlash: false,
  reactStrictMode: true,
  // Output standalone for Docker deployment
  output: 'standalone',
  // Ensure proper handling of API calls
  async rewrites() {
    // Get backend URL from environment variable
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
