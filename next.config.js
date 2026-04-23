/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Dashboard ke liye external images allow karna
  images: {
    domains: ['images.unsplash.com', 'i.pravatar.cc'],
  },

  // Backend ke liye Server Actions enable karna
  experimental: {
    serverActions: true,
  },

  // API Routes ke liye CORS headers (zaroori hai taaki external apps baat kar sakein)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },

  // Webpack logic taaki server-side modules (fs) browser mein crash na karein
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
