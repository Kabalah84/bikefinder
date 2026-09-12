/** @type {import('next').NextConfig} */

// Content Security Policy adaptada para Next.js 14 App Router
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self' https:;
  media-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.canyon.com" },
      { protocol: "https", hostname: "**.orbea.com" },
      { protocol: "https", hostname: "**.trekbikes.com" },
      { protocol: "https", hostname: "**.specialized.com" },
      { protocol: "https", hostname: "**.giant-bicycles.com" },
      { protocol: "https", hostname: "**.liv-cycling.com" },
      { protocol: "https", hostname: "**.scott-sports.com" },
      { protocol: "https", hostname: "**.cannondale.com" },
      { protocol: "https", hostname: "**.bmc-switzerland.com" },
      { protocol: "https", hostname: "**.bhbikes.com" },
      { protocol: "https", hostname: "bhbikes.b-cdn.net" },
      { protocol: "https", hostname: "**.merida-bikes.com" },
      { protocol: "https", hostname: "merida-cdn.m-c-g.net" },
      { protocol: "https", hostname: "embed.widencdn.net" },
      { protocol: "https", hostname: "**.bianchistore.es" },
      { protocol: "https", hostname: "**.bianchi.com" },
      { protocol: "https", hostname: "**.megamo.com" },
      { protocol: "https", hostname: "**.pinarello.es" },
      { protocol: "https", hostname: "**.pinarello.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

