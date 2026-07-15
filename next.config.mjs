/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Los archivos de la Fase 1 usan datos mock; sin imágenes remotas todavía.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
