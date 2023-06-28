import type { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: ["scripts/src/changelog.ts", "scripts/*.js"],
      project: ["scripts/**/*.ts", "scripts/**/*.js"],
      ignoreDependencies: ["prettier"],
    },
    "packages/*": {
      entry: "src/index.ts!",
      project: ["src/**/*.ts!", "test/**/*.ts", "test/**/*.tsx"],
    },
  },
};

export default config;
