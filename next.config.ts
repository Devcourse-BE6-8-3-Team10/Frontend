import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.devteam10.org',
        port: '',
        pathname: '/files/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/team10_bucket/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: "https://www.devteam10.org",
    NEXT_PUBLIC_WEBSOCKET_URL: "wss://www.devteam10.org/chat",
    // 백엔드 주소
    // NEXT_PUBLIC_BACKEND_URL: "http://34.64.160.179:8080",
    // NEXT_PUBLIC_WEBSOCKET_URL: "ws://34.64.160.179:8080/chat",
  },
  // WebSocket 연결을 위한 설정
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
