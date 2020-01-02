const path = require("path");

const { isFile, readDirectory } = require("./file-system");
const { Graph } = require("./graph");

const { keys } = Object;

const graph = new Graph();

for (const pkg of readDirectory("packages")) {
  /** @type {object} */
  let info;
  try {
    info = require(require.resolve(`../../packages/${pkg}/package.json`));
  } catch (err) {
    continue;
  }

  const dependencies = [
    ...keys(info.dependencies || {}),
    ...keys(info.peerDependencies || {}),
    ...keys(info.devDependencies || {})
  ];

  graph.addNode(pkg);

  for (const dependency of dependencies) {
    if (dependency.startsWith("@siteimprove/alfa-")) {
      graph.addEdge(pkg, dependency.replace(/@siteimprove\/(.+)/, "$1"));
    }
  }
}

exports.packages = graph.sort();

/**
 * Return the path to specification file matching specified file
 *
 * @param {string} file
 * @return {string?}
 */
function getSpecification(file) {
  const base = path
    .dirname(file)
    .split(path.sep)
    .map((part, index) =>
      part === "src"
        ? "test"
        : part === "scripts" && index === 0
        ? `${part}${path.sep}test`
        : part
    )
    .join(path.sep);

  const extensions = [".ts", ".tsx"];

  for (const extension of extensions) {
    const spec = path.join(
      base,
      `${path.basename(file, path.extname(file))}.spec${extension}`
    );

    if (isFile(spec)) {
      return spec;
    }
  }

  return null;
}

exports.getSpecification = getSpecification;
