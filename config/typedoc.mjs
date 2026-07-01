/** @type {import('typedoc').TypeDocOptions & import('typedoc-plugin-markdown').PluginOptions} */
export default {
  name: "Alfa API documentation",
  entryPoints: ["../packages/alfa-act", "../packages/alfa-dom"],
  entryPointStrategy: "packages",
  readme: "none",
  includeVersion: true,
  excludeExternals: true,
  plugin: [
    "@siteimprove/alfa-toolchain/typedoc-plugin-categorize",
    "typedoc-plugin-markdown",
  ],
  outputs: [
    { name: "html", path: "../docs/typedoc/html" },
    { name: "json", path: "../docs/typedoc/json" },
    {
      name: "markdown",
      path: "../docs/typedoc/markdown",
      options: {
        indexFormat: "table",
        parametersFormat: "table",
        interfacePropertiesFormat: "table",
        classPropertiesFormat: "table",
        typeAliasPropertiesFormat: "table",
        enumMembersFormat: "table",
        propertyMembersFormat: "table",
        typeDeclarationFormat: "table",
        pageTitleTemplates: {
          // While Classes do have their kind added to the page, Namespace don't
          // as they are usually used as modules, but in our case we want the
          // kind to show on the documentation page.
          module: (args) =>
            args.kind === "Namespace"
              ? `${args.kind}: ${args.name}`
              : args.name,
        },
        theme: "categorizeMarkdown",
      },
    },
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
