import { defineConfig } from "@playwright/test";

const baseURL = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

export default defineConfig({
  testDir: "./tests/api",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL
  }
});
