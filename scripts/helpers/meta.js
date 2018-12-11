const { readDirectory } = require("./file-system");
const { Graph } = require("./graph");

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
    ...Object.keys(info.dependencies || {}),
    ...Object.keys(info.peerDependencies || {}),
    ...Object.keys(info.devDependencies || {})
  ];

  graph.addNode(pkg);

  for (const dependency of dependencies) {
    if (dependency.startsWith("@siteimprove/alfa-")) {
      graph.addEdge(pkg, dependency.replace(/@siteimprove\/(.+)/, "$1"));
    }
  }
}

exports.packages = graph.sort();
