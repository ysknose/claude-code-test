import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Biomeを使用するため、Next.jsのESLintを無効化
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // クライアントサイドでNode.jsモジュールを除外
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
