import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: false,
  transpilePackages: ['@webbox/shared'],
};

export default nextConfig;
