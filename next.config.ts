import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'upload.wikimedia.org',
      'www.researchgate.net',
      'researchgate.net',
      'images.unsplash.com',
      'source.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'pnccs.edu.in',
      'www.adda247.com',
      'st.adda247.com',
      'www.adda247.in',
      'www.pnccs.edu.in'
    ],
    // Optionally unoptimize in dev
    ...(process.env.NODE_ENV === 'development' && {
      unoptimized: true,
    }),
  },
};

export default nextConfig;
