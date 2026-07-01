/** @type {import('typedoc').TypeDocOptions} */
export default {
  entryPoints: ["../src/index.ts"],
  readme: "none",
  includeVersion: true,
  excludeExternals: true,
  excludeInternal: true,
  jsDocCompatibility: false,
  excludeTags: ["@knipignore"],
  sort: ["alphabetical", "kind"],
};
