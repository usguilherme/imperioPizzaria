/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // ajuste para o domínio do seu bucket/CDN em produção
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // upload de imagens de produto via Server Action
    },
  },
};

export default nextConfig;
