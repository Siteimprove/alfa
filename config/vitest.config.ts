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
      provider: "v8",
      reporter: ["html", "text-summary"],
      watermarks: {
        branches: [80, 90],
        functions: [70, 85],
        lines: [80, 85],
        statements: [80, 85],
      },
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
