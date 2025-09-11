import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/alfa-*/test/**/*.spec.ts?(x)"],
    exclude: ["packages/alfa-test-deprecated"],
    typecheck: {
      enabled: true,
      checker: "tsc",
      include: ["packages/alfa-*/test/**/*.spec-d.ts?(x)"],
    },
    coverage: {
      reporter: ["html"],
      reportsDirectory: "./docs/coverage",
      include: ["packages/alfa-*/**"],
      exclude: [
        "packages/alfa-test*/**",
        "**/scripts/**",
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
});
