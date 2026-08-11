import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Only the pure-logic modules under lib/. Component tests would need jsdom
    // and a React renderer; the value here is in the rules that quietly break —
    // distance labels, link rewriting, session validity.
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
