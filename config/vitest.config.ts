import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts?(x)"],
    coverage: {
      provider: "v8",
      reporter: ["json", "html"],
      exclude: [
        "config/**",
        "docs/**",
        "scratches/**",
        "scripts/**",
        "**/dist/**",
        "**/scripts/**",
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
});
