/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['s4.anilist.co', 'artworks.thetvdb.com'],
    unoptimized: true,
  },
};

module.exports = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  nextConfig,
}