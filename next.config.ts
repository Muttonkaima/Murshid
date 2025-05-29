import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'upload.wikimedia.org',
      'www.researchgate.net',
      'images.unsplash.com',
      'source.unsplash.com',
      'via.placeholder.com',
      'picsum.photos'
    ],
  },
};

export default nextConfig;
