import { getPackages } from "@manypkg/get-packages";
import { Array } from "@siteimprove/alfa-array";
import { Map } from "@siteimprove/alfa-map";

import * as path from "node:path";

import { DependencyGraph } from "./dependency-graph.js";

type ClusterDefinition =
  | string
  | { name: string; children: Array<ClusterDefinition> };

type Module = { id: string; clusters: Array<string> };

const targetPath = process.argv[2] ?? ".";
const clustersDefinitionPath = path.join("config", "package-clusters.json");

generateGlobalGraph(targetPath);

/**
 * @public
 */
export async function generateGlobalGraph(rootDir: string) {
  const packages = await getPackages(rootDir);

  let fullGraph = Map.empty<string, Array<string>>();
  let heavyGraph = Map.empty<string, Array<string>>();

  for (const pkg of packages.packages) {
    fullGraph = fullGraph.set(
      pkg.packageJson.name,
      Object.keys(pkg.packageJson.dependencies ?? {})
        .concat(Object.keys(pkg.packageJson.devDependencies ?? {}))
        .filter((dep) => dep.startsWith("@siteimprove")),
    );

    heavyGraph = fullGraph.set(
      pkg.packageJson.name,
      Object.keys(pkg.packageJson.dependencies ?? {}).filter((dep) =>
        dep.startsWith("@siteimprove"),
      ),
    );
  }

  const clusters = (
    await import(path.join(rootDir, clustersDefinitionPath), {
      with: { type: "json" },
    })
  ).default as Array<ClusterDefinition>;

  function* getClusters(
    clusters: Array<ClusterDefinition>,
    acc: Array<string>,
  ): Iterable<Module> {
    for (const cluster of clusters) {
      if (typeof cluster === "string") {
        yield { id: cluster, clusters: acc };
      } else {
        yield* getClusters(cluster.children, [...acc, cluster.name]);
      }
    }
  }

  const modules = [...getClusters(clusters, [])];

  const circular: Array<string> = [];

  const baseCluster = "Alfa";
  const clusterize = (module: string) =>
    modules.find((m) => m.id === module)?.clusters || [];
  const clusterId = (cluster: string) => cluster;
  const clusterLabel = (cluster: string) => cluster;

  const moduleId = (module: string) => module;
  const moduleName = (module: string) => module.replace("@siteimprove/", "");
  const isEntryPoint = () => false;

  await DependencyGraph.of<string, string>(
    { name: "Alfa", fullGraph, heavyGraph, circular, clusterize },
    { baseCluster, clusterId, clusterLabel },
    { moduleId, moduleName, isEntryPoint },
  ).save(rootDir);
}
