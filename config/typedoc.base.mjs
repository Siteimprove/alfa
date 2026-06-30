/** @type {import('typedoc').TypeDocOptions} */
export default {
  entryPoints: ["../src/index.ts"],
  includeVersion: true,
  excludeExternals: true,
  excludeInternal: false,
  jsDocCompatibility: false,
  excludeTags: ["@knipignore"],
  sort: ["alphabetical", "kind"],
};
