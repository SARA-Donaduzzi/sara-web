/** @type {import('next').NextConfig} */

// Host do object storage que serve imagens e PDFs.
// Configure NEXT_PUBLIC_STORAGE_HOST no seu .env para apontar para a
// sua propria instancia de MinIO ou S3.
const storageHost = process.env.NEXT_PUBLIC_STORAGE_HOST;

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/files/**",
      },
      ...(storageHost
        ? [
            {
              protocol: "https",
              hostname: storageHost,
              port: "",
              pathname: "/sara-images/**",
            },
            {
              protocol: "https",
              hostname: storageHost,
              port: "",
              pathname: "/sara-pdfs/**",
            },
          ]
        : []),
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
