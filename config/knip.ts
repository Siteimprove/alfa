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
    "packages/alfa-device": { entry: [...entry, "src/native.ts!"], project },
    "packages/alfa-dom": {
      entry: [
        ...entry,
        "src/h.ts!",
        "src/jsx.ts!",
        "src/jsx-runtime.ts!",
        "src/native.ts!",
      ],
      project,
    },
    "packages/alfa-web": { entry: [...entry, "src/native.ts!"], project },
  },
  // Do not check deprecated packages since we do not want to spend time
  // updating them.
  ignoreWorkspaces: ["packages/alfa-media"],
};

export default config;
