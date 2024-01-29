import type { KnipConfig } from "knip";

const entry = ["src/index.ts!", "test/**/*.ts", "test/**/*.tsx"];
const project = ["src/**/*.ts!", "test/**/*.ts", "test/**/*.tsx"];

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: ["scripts/*.mjs"],
      project: ["scripts/**/*.mjs"],
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
  // Do not check deprecated packages since we do not want to spend time
  // updating them.
  ignoreWorkspaces: ["packages/alfa-media"],
};

export default config;
