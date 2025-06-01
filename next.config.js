/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose environment variables to the client side
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  // Enable CORS for development
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
  // ✅ Add allowed external image domains here
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
      'www.pnccs.edu.in',
    ],
    // Optionally disable optimization in development
    ...(process.env.NODE_ENV === 'development' && {
      unoptimized: true,
    }),
  },

  // Enable source maps in development
  productionBrowserSourceMaps: true,
  // Enable React Strict Mode
  reactStrictMode: true,
};

module.exports = nextConfig;
