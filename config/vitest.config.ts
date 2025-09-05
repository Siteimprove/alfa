import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/alfa-*/test/**/*.spec.ts?(x)"],
    exclude: ["packages/alfa-test-deprecated"],
    typecheck: {
      enabled: true,
      checker: "tsc",
      include: ["packages/alfa-*/test/**/*.spec-d.ts?(x)"],
    },
  },
});
