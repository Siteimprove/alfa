import type { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: ["scripts/*.js"],
      project: ["scripts/**/*.ts", "scripts/**/*.js"],
      ignoreDependencies: ["prettier"],
    },
    "packages/*": {
      entry: "src/index.ts!",
      project: ["src/**/*.ts!", "test/**/*.ts", "test/**/*.tsx"],
    },
    "packages/alfa-device": {
      entry: ["src/index.ts!", "native.ts!"],
      project: ["src/**/*.ts!", "test/**/*.ts", "test/**/*.tsx"],
    },
    "packages/alfa-dom": {
      entry: [
        "src/index.ts!",
        "h.ts!",
        "jsx.ts!",
        "jsx-runtime.ts!",
        "native.ts!",
      ],
      project: ["src/**/*.ts!", "test/**/*.ts", "test/**/*.tsx"],
    },
    "packages/alfa-toolchain": {
      entry: ["src/index.ts!", "src/changelog.ts!"],
      project: ["src/**/*.ts!", "test/**/*.ts"],
    },
    "packages/alfa-web": {
      entry: ["src/index.ts!", "native.ts!"],
      project: ["src/**/*.ts!", "test/**/*.ts", "test/**/*.tsx"],
    },
  },
};

export default config;
