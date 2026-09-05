import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // Plan acceptance criterion 5: no horizontal scroll at 360px.
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
