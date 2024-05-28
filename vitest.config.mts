import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/alfa-act/test/**/*.spec.ts",
      "packages/alfa-affine/test/**/*.spec.ts",
      "packages/alfa-rules/test/sia-r113/rule.spec.tsx",
    ],
  },
});
