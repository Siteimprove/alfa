import type { KnipConfig } from "knip";

const entry = ["src/index.ts!", "test/**/*.ts", "test/**/*.tsx"];
const project = ["src/**/*.ts!", "test/**/*.ts", "test/**/*.tsx"];

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: ["scripts/*.js"],
      project: ["scripts/**/*.ts", "scripts/**/*.js"],
      ignoreDependencies: ["prettier"],
    },
    "packages/*": { entry, project },
    "packages/alfa-device": { entry: [...entry, "native.ts!"], project },
    "packages/alfa-dom": {
      entry: [...entry, "h.ts!", "jsx.ts!", "jsx-runtime.ts!", "native.ts!"],
      project,
    },
    "packages/alfa-web": { entry: [...entry, "native.ts!"], project },
  },
};

export default config;
