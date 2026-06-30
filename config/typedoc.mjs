/** @type {import('typedoc').TypeDocOptions} */
export default {
  name: "Alfa API documentation",
  entryPoints: ["../packages/alfa-*"],
  entryPointStrategy: "packages",
  includeVersion: false,
  excludeExternals: true,
  plugin: [
    "typedoc-plugin-markdown",
    "@siteimprove/alfa-toolchain/typedoc-plugin-categorize",
  ],
  outputs: [
    { name: "html", path: "../docs/typedoc/html" },
    { name: "markdown", path: "../docs/typedoc/markdown" },
  ],
  router: "structure",
  favicon: "../media/icon.svg",
  sourceLinkExternal: true,
  navigationLinks: {
    "Alfa rules documentation": "https://alfa.siteimprove.com",
    Siteimprove: "https://siteimprove.com",
  },
  useFirstParagraphOfCommentAsSummary: true,
  navigation: {
    includeCategories: true,
  },
};
