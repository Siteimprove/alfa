let gitRevision;
let sourceLinkTemplate;
let markdown = false;
let html = false;
let json = false;

const target = process.env.ALFA_DOC_TARGET;

if (target !== "review" && target !== "documentation") {
  console.error(
    `Need one ALFA_DOC_TARGET of either "review" or "documentation"`,
  );
  process.exit(1);
}

if (target === "review") {
  markdown = true;
  gitRevision = "main";
  sourceLinkTemplate =
    "https://github.com/Siteimprove/alfa/blob/{gitRevision}/{path}";
}

if (target === "documentation") {
  // Adapted from https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
  // by adding the starting "v" and ending the line after the 3 numbers.
  // This matches what we use for tags when making a release.
  const semVerRegex =
    // v
    // Three identical capture groups, separated by dots.
    // Each group is either 0 or any number of digits, starting with a non-0.
    /^v(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)$/;
  if ((process.env.ALFA_DOC_VERSION ?? "").match(semVerRegex) === null) {
    console.error(
      `An ALFA_DOC_TARGET of "documentation" requires an ALFA_DOC_VERSION of "vx.y.z" with three numbers x, y, and z`,
    );
    process.exit(2);
  }
  html = true;
  json = true;
  gitRevision = process.env.ALFA_DOC_VERSION;
}

/** @type {import('typedoc').TypeDocOptions & import('typedoc-plugin-markdown').PluginOptions} */
export default {
  name: "Alfa API documentation",
  entryPoints: ["../packages/alfa-act", "../packages/alfa-dom"],
  entryPointStrategy: "packages",
  readme: "none",
  includeVersion: true,
  excludeExternals: true,
  packageOptions: {
    entryPoints: ["src/index.ts"],
    gitRevision,
    sourceLinkTemplate,
    readme: "none",
    includeVersion: true,
    excludeExternals: true,
    excludeInternal: false,
    jsDocCompatibility: false,
    excludeTags: ["@knipignore"],
    sort: ["alphabetical", "kind"],
  },
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
