import { getPackages } from "@manypkg/get-packages";
import { Array } from "@siteimprove/alfa-array";
import { Map } from "@siteimprove/alfa-map";

import * as path from "node:path";

import { DependencyGraph } from "./dependency-graph.js";

/** @internal */
export type ClusterDefinition =
  | string
  | { name: string; children: Array<ClusterDefinition> };

/** @internal */
export type Module = { id: string; clusters: Array<string> };

const targetPath = process.argv[2] ?? ".";
const clustersDefinitionPath = path.join("config", "package-clusters.json");
const destinationPath = "docs";

await createGlobalGraph(targetPath);

/**
 * Generate the global dependency graph between all packages in the monorepo
 * with a given scope.
 *
 * @remarks
 * * Modules are packages, identified by their name, clusters are defined in an
 *   adhoc way.
 * * Clusterization is pre-built by parsing the clusters definition file.
 * * Clusters' id and name are the one set in the clusters definition file.
 * * Modules' id is the package name, and their name is the package name stripped
 *   of the `@siteimprove/` scope.
 * * There should be no circular dependencies as these are caught by TypeScript.
 * * No module is specifically considered an entry point for its cluster.
 * * "light" edges are dev dependencies.
 *
 * @public
 */
export async function createGlobalGraph(
  rootDir: string,
): Promise<DependencyGraph<string, string>> {
  const { name, scope, clusters } = (
    await import(path.join(rootDir, clustersDefinitionPath), {
      with: { type: "json" },
    })
  ).default as {
    name: string;
    scope: string;
    clusters: Array<ClusterDefinition>;
  };

  const packages = await getPackages(rootDir);

  const fullGraph = Map.from(
    packages.packages.map(({ packageJson }) => [
      packageJson.name,
      getAllScopedDependencies(packageJson, scope),
    ]),
  );

  const heavyGraph = Map.from(
    packages.packages.map(({ packageJson }) => [
      packageJson.name,
      getScopedProdDependencies(packageJson, scope),
    ]),
  );

  const modules = [...getClusters(clusters)];

  const circular: Array<string> = [];

  const clusterize = (module: string) =>
    modules.find((m) => m.id === module)?.clusters ?? [];
  const clusterId = (cluster: string) => cluster;
  const clusterLabel = (cluster: string) => cluster;

  const moduleId = (module: string) => module;
  const moduleName = (module: string) => module.replace(scope + "/", "");
  const isEntryPoint = () => false;

  console.log(path.join(rootDir, destinationPath));

  return DependencyGraph.of<string, string>(
    { name, fullGraph, heavyGraph, circular, clusterize },
    { baseCluster: name, clusterId, clusterLabel },
    { moduleId, moduleName, isEntryPoint },
  );
}

/**
 * Get a list of modules, with their clusters, from the clusters definition.
 *
 * @internal
 */
export function* getClusters(
  clusters: Array<ClusterDefinition>,
  acc: Array<string> = [],
): Iterable<Module> {
  for (const cluster of clusters) {
    if (typeof cluster === "string") {
      yield { id: cluster, clusters: acc };
    } else {
      yield* getClusters(cluster.children, [...acc, cluster.name]);
    }
  }
}

/** @internal */
export function getAllScopedDependencies(
  pkg: {
    dependencies?: { [key: string]: string };
    devDependencies?: { [key: string]: string };
  },
  scope: string,
): Array<string> {
  return Object.keys(pkg.dependencies ?? {})
    .concat(Object.keys(pkg.devDependencies ?? {}))
    .filter((dep) => dep.startsWith(scope));
}

/** @internal */
export function getScopedProdDependencies(
  pkg: {
    dependencies?: { [key: string]: string };
  },
  scope: string,
): Array<string> {
  return Object.keys(pkg.dependencies ?? {}).filter((dep) =>
    dep.startsWith(scope),
  );
}
