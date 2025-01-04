/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/Thought-organizer-v2' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true
}

export default nextConfig
