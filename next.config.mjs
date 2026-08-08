/** @type {import('next').NextConfig} */
const nextConfig = {
  // `typescript.ignoreBuildErrors` was on, which meant a broken build shipped silently —
  // it hid a real error in this project at least once. The project typechecks clean, so
  // the build should be allowed to fail.
  images: {
    // Was `unoptimized: true`, which served full-size originals: the sector photos are
    // ~200KB each and the logo is 1500x1080. sharp is installed and its build approved
    // in pnpm-workspace.yaml, so optimisation works in production.
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            // accelerometer/gyroscope are explicitly allowed — the tilt parallax needs
            // them, and a restrictive default would silently disable it.
            value: "camera=(), microphone=(), geolocation=(), accelerometer=(self), gyroscope=(self)",
          },
        ],
      },
    ]
  },
}

export default nextConfig
