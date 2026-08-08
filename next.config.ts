import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Keep Turbopack rooted on this project
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
