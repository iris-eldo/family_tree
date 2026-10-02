import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    globals: true,
    exclude: [
      // Default Vitest excludes
      "**/node_modules/**",
      "**/dist/**",
      // Exclude worktrees created by other Claude sessions — they have their
      // own test files that import modules not present in this branch
      "**/.claude/worktrees/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
