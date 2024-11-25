import type { KnipConfig } from "knip";

const entry = ["src/index.ts!", "test/**/*.ts", "test/**/*.tsx"];
const project = ["src/**/*.ts!", "test/**/*.ts", "test/**/*.tsx"];

const config: KnipConfig = {
  // This can be cleaned once we get a better split in the release workflow
  // to let callers do their own local setup.
  ignoreBinaries: ["playwright"],
  workspaces: {
    ".": {
      entry: ["scripts/*.mjs"],
      project: ["scripts/**/*.mjs"],
      ignoreDependencies: ["prettier"],
    },
    "packages/*": { entry, project },
    "packages/alfa-cascade": {
      entry,
      project,
      // For some reason, knip doesn't detect that Bucket is used in the test
      // file and needs to be exported for that.
      ignore: ["src/ancestor-filter.ts"],
    },
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
};

export default config;
