import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["three"],
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
