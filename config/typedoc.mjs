// We use environment variabales to pass parameters because the script
// invokation is mangled into yarn and typedoc own invokations.

// Check that we have a target (review/documentation)
const target = process.env.ALFA_DOC_TARGET;
if (target !== "review" && target !== "documentation") {
  console.error(
    `Need one ALFA_DOC_TARGET of either "review" or "documentation"`,
  );
  process.exit(1);
}

// Set up the source link parameters and choose outputs, based on target.
// * For "review", we generate Markdown with a stable source link (main branch,
//   no line number) and minimum text, as this is meant to be shipped with every
//   PR and we want to avoid changes due to irrelevant details (git hash or
//   adding a new line and changing numbers).
// * For "documentation", we generate Markdown,  HTML and JSON, linking to the
//   git tag of the release. The tag cannot be guessed, as it should not have
//   been created yet, as the newer documentation must be part of that tag… So
//   we also pass it along. The JSON documentation is used for merging with
//   other repos.
let gitRevision;
let disableSources;
let review = false;
let markdown = false;
let html = false;
let json = false;

if (target === "review") {
  review = true;
  gitRevision = "main";
  disableSources = true;
}

if (target === "documentation") {
  // Adapted from https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
  // by adding the starting "v" and ending the line after the 3 numbers.
  // This matches what we use for tags when making a release.
  const semVerRegex =
    // start of line
    // v
    // Three identical capture groups, separated by dots.
    //   Each group is either 0 or any number of digits, starting with a non-0.
    // end of line
    /^v(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)$/;
  if ((process.env.ALFA_DOC_VERSION ?? "").match(semVerRegex) === null) {
    console.error(
      `An ALFA_DOC_TARGET of "documentation" requires an ALFA_DOC_VERSION of "vx.y.z" with three numbers x, y, and z`,
    );
    process.exit(2);
  }
  markdown = true;
  html = true;
  json = true;
  gitRevision = process.env.ALFA_DOC_VERSION;
}

// Validation
if (review && markdown) {
  console.error(
    "'review' and 'markdown' cannot be generated together as they use the same post-processor, with different options",
  );
  process.exit(3);
}

// Set up the outputs parameters.
const outputs = [];
if (html) {
  outputs.push({ name: "html", path: "../docs/typedoc/html" });
}
if (json) {
  outputs.push({ name: "json", path: "../docs/typedoc/json" });
}
if (markdown) {
  outputs.push({
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
          args.kind === "Namespace" ? `${args.kind}: ${args.name}` : args.name,
      },
      // Add the kind to reflections with the same name in a table (typically
      // class/diagnostic).
      theme: ["categorizeMarkdown"],
    },
  });
}

if (review) {
  outputs.push({
    name: "markdown",
    path: "../docs/typedoc/review",
    options: {
      parametersFormat: "table",
      hidePageHeader: true,
      hideBreadcrumbs: true,
      useCodeBlocks: true,
      expandObjects: true,
      expandParameters: true,
      pageTitleTemplates: {
        // While Classes do have their kind added to the page, Namespace don't
        // as they are usually used as modules, but in our case we want the
        // kind to show on the documentation page.
        module: (args) =>
          args.kind === "Namespace" ? `${args.kind}: ${args.name}` : args.name,
      },
      // Add the kind to reflections with the same name in a table (typically
      // class/diagnostic), and remove line number from links' names.
      theme: ["reviewTheme"],
    },
  });
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
    disableSources,
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
    "@siteimprove/alfa-toolchain/typedoc-markdown-theme-review",
    "typedoc-plugin-markdown",
  ],
  outputs,
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
