import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  swcMinify: true,
  compress: true,
  
  // Disable source maps in production to prevent code exposure
  productionBrowserSourceMaps: false,
  
  // Optimize output
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Optimize chunks and minify
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Aggressive minification in production
      config.optimization = {
        ...config.optimization,
        minimize: true,
        usedExports: true,
        sideEffects: false,
      };
    }
    return config;
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
