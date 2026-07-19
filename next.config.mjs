/** @type {import('next').NextConfig} */
const nextConfig = {
  // خروجی standalone برای ایمیج سبک Docker (server.js مستقل، PORT/HOSTNAME را می‌خواند)
  output: "standalone",
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
