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
      reporter: ["html", "text-summary", "json-summary"],
      watermarks: {
        // These are reasonable watermarks that put us in the green zone (except
        // for functions) in the current state. We should raise them over time
        // as situation improves.
        branches: [80, 90],
        functions: [65, 85],
        lines: [80, 85],
        statements: [80, 85],
      },
      reportsDirectory: "./docs/coverage",
      include: ["packages/alfa-*/**/*.ts?(x)", "packages/alfa-*/**/*.js?(x)"],
      exclude: [
        "packages/alfa-test*/**",
        "**/config/**",
        "**/docs/**",
        "**/scripts/**",
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
});
