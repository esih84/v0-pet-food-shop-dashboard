/** @type {import('next').NextConfig} */
const nextConfig = {
  // اجازه‌ی دسترسی dev-server از IP شبکه/WSL (رفع هشدار cross-origin)
  allowedDevOrigins: ["172.18.192.1"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
