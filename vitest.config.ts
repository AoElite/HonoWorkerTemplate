import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./wrangler.jsonc" },
    }),
  ],
  test: {
    // The first request pays the cost of importing the full module graph
    // inside workerd; keep headroom for cold starts on slower CI runners.
    testTimeout: 15000,
  },
});
