/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/Thought-organizer-v2' : '',
  images: {
    unoptimized: true,
  },
  // Ensure the download page is included in the static export
  trailingSlash: true,
  // Generate the download page during build
  generateStaticParams: async () => {
    return [
      { slug: 'download' }
    ]
  },
  // Explicitly define routes for static export
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      '/': { page: '/' },
      '/download': { page: '/download' },
    }
  }
}

export default nextConfig
