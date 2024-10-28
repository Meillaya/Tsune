/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['s4.anilist.co', 'artworks.thetvdb.com'],
    unoptimized: true,
  },
};

module.exports = nextConfig;