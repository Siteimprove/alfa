const path = require("path");
const { packages } = require("./helpers/meta");
const { Manifest } = require("./helpers/manifest");
const { and, not, startsWith, endsWith } = require("./helpers/predicates");
const { isFile, findFiles } = require("./helpers/file-system");
const notify = require("./helpers/notify");

const master = new Manifest("package.json");

/**
 * These are the fields we want to keep in sync between the different package
 * manifest of packages within Alfa.
 *
 * @type {Array<string>}
 */
const sync = [
  "author",
  "homepage",
  "license",
  "description",
  "keywords",
  "repository",
  "bugs"
];

for (const directory of packages) {
  const root = `packages/${directory}`;

  const pkg = new Manifest(`${root}/package.json`);

  for (const field of sync) {
    pkg.set(field, master.get(field));
  }

  references(root, pkg, {
    peer: true,
    dev: true
  });

  notify.success(pkg.get("name") || directory);
}

/**
 * Update tsconfig.json in directory with
 * - Add all .ts?(x) files to files
 * - Add @siteimprove/ dependencies from package.json as relative path references
 * @param {string} directory
 * @param {Manifest} pkg
 * @param {{ normal?: boolean, dev?: boolean, peer?: boolean }} [options]
 * @param {Array<string>} [additional]
 */
function references(directory, pkg, options = {}, additional = []) {
  const file = `${directory}/tsconfig.json`;

  if (!isFile(file)) {
    return;
  }

  const config = new Manifest(file);

  const files = [
    ...findFiles(
      directory,
      and(endsWith(".ts", ".tsx"), not(endsWith(".d.ts")))
    )
  ]
    .map(file =>
      path
        .relative(directory, file)
        .split(path.sep)
        .join("/")
    )
    .sort();

  config.set("files", files);

  const references = [...pkg.dependencies(options).keys()]
    .filter(startsWith("@siteimprove/"))
    .map(dependency => dependency.replace("@siteimprove/", "../"))
    .concat(additional)
    .sort()
    .map(dependency => {
      return {
        path: dependency
      };
    });

  config.set("references", references);
}
