/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Rewrites are only needed for LOCAL development where the FastAPI
  // backend runs as a separate process on port 8000.
  // On Vercel, vercel.json routes handle /api/* → api/index.py directly,
  // so we skip rewrites entirely when the VERCEL env var is present.
  async rewrites() {
    if (process.env.VERCEL) return []

    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000"
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
