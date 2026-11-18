import { defineConfig } from "@playwright/test";

// Serves the static export from ./out on localhost only.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:3101", viewport: { width: 1440, height: 900 } },
  webServer: {
    command: "node scripts/serve-static.mjs 3101",
    url: "http://127.0.0.1:3101",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
