/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  basePath: process.env.NODE_ENV === 'production' ? '/Thought-organizer-v2' : '',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
