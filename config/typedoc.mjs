import { OptionDefaults } from "typedoc";

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  name: "Alfa",
  entryPointStrategy: "packages",
  entryPoints: ["../packages/alfa-*"],
  packageOptions: {
    entryPoints: ["src/index.ts"],
    includeVersion: true,
    excludeInternal: true,
    useTsLinkResolution: false,
  },
  outputs: [
    {
      name: "html",
      path: "../docs/typedoc/html",
    },
    {
      name: "json",
      path: "../docs/typedoc/json",
    },
    {
      name: "markdown",
      path: "../docs/typedoc/markdown",
    },
  ],
  router: "structure",
  plugin: ["typedoc-plugin-markdown", "typedoc-plugin-coverage"],
  highlightLanguages: ["markdown", ...OptionDefaults.highlightLanguages],
};

export default config;
