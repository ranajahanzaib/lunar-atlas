import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx", "../../packages/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@lunar-atlas/scientific-types": path.resolve(
        __dirname,
        "../../packages/scientific-types/index.ts",
      ),
      "@lunar-atlas/lunar-geometry": path.resolve(
        __dirname,
        "../../packages/lunar-geometry/index.ts",
      ),
    },
  },
});
