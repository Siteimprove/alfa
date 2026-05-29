import { coverageConfigDefaults, defineConfig } from "vitest/config";

// ALFA_PATH is set by the coverage:package path in the global package.json
// manifest file.
// The default for alfaPath is to include all packages, unless overwritten by
// ALFA_PATH.
const alfaPath = process.env.ALFA_PATH ?? "packages/alfa-*";

console.log(`Testing ${alfaPath}`);

export default defineConfig({
  test: {
    include: [`${alfaPath}/test/**/*.spec.ts?(x)`],
    typecheck: {
      enabled: true,
      checker: "tsc",
      include: [`${alfaPath}/test/**/*.spec-d.ts?(x)`],
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
        lines: [75, 85],
        statements: [75, 85],
      },
      reportsDirectory: `${process.env.ALFA_PATH ?? "."}/docs/coverage`,
      include: [`${alfaPath}/**/*.{js,jsx,ts,tsx}`],
      exclude: [
        "packages/alfa-test/**",
        "**/config/**",
        "**/docs/**",
        "**/scripts/**",
        "**/*.d.ts",
        "**/*-d.ts",
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
});
