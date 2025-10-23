import { Array } from "@siteimprove/alfa-array";
import { Map } from "@siteimprove/alfa-map";

import type { Package, Packages } from "@manypkg/get-packages";
import madge from "madge";
import { DependencyGraph } from "./dependency-graph.js";

import * as path from "node:path";

/**
 * Factory functions for building Dependency graphs.
 *
 * @public
 */
export namespace GraphFactory {
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
   *
   * @public
   */
  export async function fromPackage(
    pkg: Package,
  ): Promise<DependencyGraph<string, string>> {
    // Exclude files that are not inside the base directory.
    // These are in other packages, which we don't care about here.
    const notPkg = new RegExp(`^../`);

    const fullDepTree = await madge(path.join(pkg.dir, "src"), {
      fileExtensions: ["ts", "tsx"],
      excludeRegExp: [/[.]d[.]ts/, notPkg],
      baseDir: pkg.dir,
    });

    const noTypeDepTree = await madge(path.join(pkg.dir, "src"), {
      fileExtensions: ["ts", "tsx"],
      excludeRegExp: [/[.]d[.]ts/, notPkg],
      detectiveOptions: { ts: { skipTypeImports: true } },
      baseDir: pkg.dir,
    });

    return DependencyGraph.of({
      ...Individual,
      name: pkg.packageJson.name,
      fullGraph: Map.from(Object.entries(fullDepTree.obj())),
      heavyGraph: Map.from(Object.entries(noTypeDepTree.obj())),
      circular: Array.flatten(noTypeDepTree.circular()),
      baseCluster: "src",
    });
  }

  export function fromPackagesList(
    packages: Packages,
    {
      clusters,
      name,
      scope,
    }: {
      clusters: Array<Global.ClusterDefinition>;
      name: string;
      scope: string;
    },
  ) {
    const fullGraph = Map.from(
      packages.packages.map(({ packageJson }) => [
        packageJson.name,
        Global.getAllScopedDependencies(packageJson, scope),
      ]),
    );

    const heavyGraph = Map.from(
      packages.packages.map(({ packageJson }) => [
        packageJson.name,
        Global.getScopedProdDependencies(packageJson, scope),
      ]),
    );

    const modules = [...Global.getClusters(clusters)];

    const circular: Array<string> = [];

    const clusterize = (module: string) =>
      modules.find((m) => m.id === module)?.clusters ?? [];
    const clusterId = (cluster: string) => cluster;
    const clusterLabel = (cluster: string) => cluster;

    const moduleId = (module: string) => module;
    const moduleName = (module: string) => module.replace(scope + "/", "");
    const isEntryPoint = () => false;

    return DependencyGraph.of<string, string>({
      name,
      fullGraph,
      heavyGraph,
      circular,
      clusterize,
      baseCluster: name,
      clusterId,
      clusterLabel,
      moduleId,
      moduleName,
      isEntryPoint,
    });
  }

  /** @internal */
  export namespace Individual {
    /**
     * Returns the clusters (directories) a module (file) belongs to.
     *
     * /foo/bar/baz.ts -> ["/foo", "/foo/bar"]
     */
    export function clusterize(module: string): Array<string> {
      const clustersList = module.split(path.sep);
      let clusters: Array<string> = [];

      for (let i = 0; i < clustersList.length - 1; i++) {
        clusters.push(clustersList.slice(0, i + 1).join(path.sep));
      }

      return clusters;
    }

    /**
     * Returns the id of a cluster, i.e., its full path.
     */
    export function clusterId(cluster: string): string {
      return cluster;
    }

    /**
     * Returns the label of a cluster, i.e., the last segment of its path.
     */
    export function clusterLabel(cluster: string): string {
      const parts = cluster.split(path.sep);
      return parts[parts.length - 1];
    }

    /**
     * Returns the id of a module, i.e., its full path.
     */
    export function moduleId(module: string): string {
      return module;
    }

    /**
     * Returns the name of a module, i.e., the last segment of its path.
     */
    export function moduleName(module: string): string {
      const parts = module.split(path.sep);
      return parts[parts.length - 1];
    }

    /**
     * Checks if a module is an entry point for its directory.
     *
     * These are exactly the "index.ts" files.
     */
    export function isEntryPoint(module: string): boolean {
      return module.endsWith("index.ts");
    }
  }

  /** @internal */
  export namespace Global {
    /** @internal */
    export type ClusterDefinition =
      | string
      | { name: string; children: Array<ClusterDefinition> };

    /** @internal */
    export type Module = { id: string; clusters: Array<string> };

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
  }
}
