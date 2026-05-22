import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true,
    serverComponentsExternalPackages: ['@prisma/client'],
    outputFileTracingIncludes: {
      '/api/**/*': [
        './node_modules/.prisma/client/**',
        './node_modules/@prisma/client/**',
      ],
    },
  },
  webpack: (config) => {
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      ...(config.resolve.modules ?? ['node_modules']),
    ];
    return config;
  },
};

export default nextConfig;
