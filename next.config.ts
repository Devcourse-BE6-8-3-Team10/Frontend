import type { NextConfig } from "next";
import { BASE_URL } from "./src/config/urlConfig";

// BASE_URL에서 프로토콜, 호스트명, 포트 추출
const url = new URL(BASE_URL);
const protocol = url.protocol.replace(':', '') as 'http' | 'https';
const hostname = url.hostname;
const port = url.port || '';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: protocol,
        hostname: hostname,
        port: port,
        pathname: '/files/**',
      },
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
    NEXT_PUBLIC_BACKEND_URL: BASE_URL,
    NEXT_PUBLIC_WEBSOCKET_URL: BASE_URL.replace(/^http/, 'ws'),
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