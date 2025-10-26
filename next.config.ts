import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicitly set the Turbopack root to the project directory
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig;
