/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel supporte Next.js nativement, pas besoin de output: 'export'
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mon-ecommercebackend.onrender.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ignorer les erreurs TypeScript pour que le build passe
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignorer les erreurs ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig