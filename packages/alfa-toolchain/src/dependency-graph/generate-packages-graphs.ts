import { Array } from "@siteimprove/alfa-array";
import { Map } from "@siteimprove/alfa-map";

import { getPackages, type Package } from "@manypkg/get-packages";
import madge from "madge";

import { DependencyGraph } from "./dependency-graph.js";
import { saveGraph } from "./save-graph.js";

const targetPath = process.argv[2] ?? ".";

generatePackagesGraphs(targetPath);

/**
 * Generates and saves internal dependency graphs for each workspace in the
 * directory.
 *
 * @remarks
 * This requires graphviz to be installed on the OS, even just importing this
 * file requires so as @ts-graphviz/adapter test for presence upon load.
 *
 * The "." directory is relative to this file for dynamic import, not to the
 * shell invocation directory. So it is always safer to pass the actual root
 * directory as CLI option, typically using "$(pwd)" to let the shell handle it
 *
 * @public
 */
export async function generatePackagesGraphs(rootDir: string) {
  const packages = await getPackages(rootDir);
  for (const pkg of packages.packages) {
    await saveGraph(await fromPackage(pkg), `${pkg.dir}/docs`);
  }
}

/**
 * Generates a dependency graph from a package.
 *
 * @remarks
 * Uses madge to build the actual graph.
 *
 * @remarks
 * Modules are files, identified by their path relative to the package root.
 * Clusters are directories, identified by their path relative to the package root.
 * Clusters' and modules' id are the full path, while their name is the last
 * part of the path. So clusters/module operations are mostly slicing strings
 * at '/'.
 */
async function fromPackage(
  pkg: Package,
): Promise<DependencyGraph<string, string>> {
  // Exclude files that are not inside the base directory.
  // These are in other packages, which we don't care about here.
  const notPkg = new RegExp(`^../`);

  const fullDepTree = await madge(`${pkg.dir}/src`, {
    fileExtensions: ["ts", "tsx"],
    excludeRegExp: [/[.]d[.]ts/, notPkg],
    baseDir: pkg.dir,
  });

  const noTypeDepTree = await madge(`${pkg.dir}/src`, {
    fileExtensions: ["ts", "tsx"],
    excludeRegExp: [/[.]d[.]ts/, notPkg],
    detectiveOptions: { ts: { skipTypeImports: true } },
    baseDir: pkg.dir,
  });

  return DependencyGraph.of(
    {
      name: pkg.packageJson.name,
      fullGraph: Map.from(Object.entries(fullDepTree.obj())),
      heavyGraph: Map.from(Object.entries(noTypeDepTree.obj())),
      circular: Array.flatten(noTypeDepTree.circular()),
      clusterize,
    },
    { baseCluster: "src", clusterId, clusterLabel },
    { moduleId, moduleName, isEntryPoint },
  );
}

/**
 * Returns the clusters (directories) a module (file) belongs to.
 *
 * /foo/bar/baz.ts -> ["/foo", "/foo/bar"]
 */
function clusterize(module: string): Array<string> {
  const clustersList = module.split("/");
  let clusters: Array<string> = [];

  for (let i = 0; i < clustersList.length - 1; i++) {
    clusters.push(clustersList.slice(0, i + 1).join("/"));
  }

  return clusters;
}

/**
 * Returns the id of a cluster, i.e., its full path.
 */
function clusterId(cluster: string): string {
  return cluster;
}

/**
 * Returns the label of a cluster, i.e., the last segment of its path.
 */
function clusterLabel(cluster: string): string {
  const parts = cluster.split("/");
  return parts[parts.length - 1];
}

/**
 * Returns the id of a module, i.e., its full path.
 */
function moduleId(module: string): string {
  return module;
}

/**
 * Returns the name of a module, i.e., the last segment of its path.
 */
function moduleName(module: string): string {
  const parts = module.split("/");
  return parts[parts.length - 1];
}

/**
 * Checks if a module is an entry point for its directory.
 *
 * These are exactly the "index.ts" files.
 */
function isEntryPoint(module: string): boolean {
  return module.endsWith("index.ts");
}
