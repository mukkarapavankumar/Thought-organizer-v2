/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/Thought-organizer-v2' : '',
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes for consistent routing
  trailingSlash: true,
  // Configure static routes
  rewrites: async () => {
    return [
      {
        source: '/download',
        destination: '/download/index.html',
      },
    ]
  }
}

export default nextConfig
