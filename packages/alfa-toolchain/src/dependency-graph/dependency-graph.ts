import { Array } from "@siteimprove/alfa-array";
import { Map } from "@siteimprove/alfa-map";
import { Set } from "@siteimprove/alfa-set";

import type { Package } from "@manypkg/get-packages";
import * as fs from "node:fs";
import madge from "madge";
import * as path from "node:path";
import * as gv from "ts-graphviz";
import * as adapter from "@ts-graphviz/adapter";

import { Rainbow } from "./rainbow.js";

/**
 * Build the dependency graph of a module.
 *
 * @remarks
 * * Files are grouped by directories and sub-directories. Dependency arrows
 *   are cut at directory limit, and de-duplicated.
 *   So, if foo/foo1.ts depends on bar/bar1.ts; and foo/foo2.ts depends on
 *   bar/bar2.ts, there will be only one edge from foo to bar. This de-clutters
 *   the graph.
 * * Each directory is also having an "exit" node (invisible). Edges that go
 *   out of that directory are effectively starting from this exit node (and
 *   cut at the directory limit). Each file within that directory has an
 *   invisible edge to the exit node.
 *   This serves two purpose: (i) the inter-directory edges start from a known
 *   position, not randomly one of the file in it, thus look like they connect
 *   to the cluster at a reasonable position; (ii) the invisible edges rigidify
 *   the structure and give less leeway to graphviz for placing nodes. This
 *   tends to give better visual results globally
 * * Each directory also has a "name" node that is visible and serve as an
 *   entry point for all edges connecting to that directory. This serves as
 *   having the inter-directory edges ending in a known position.
 * * Each directory is assigned a random color, evenly spaced on the "rainbow
 *   spectrum". The name node, the index.ts node, and all inter-directory edges
 *   inherit that color, as a visual help.
 * * Type dependencies are dotted.
 * * files forming a circular true dependency are colored in red; these should
 *   probably be investigated and de-entangled. In several case, this might
 *   just be an improperly stated type dependency.
 *
 * @public
 */
export class DependencyGraph<C extends string, M extends string> {
  public static of<Cluster extends string, Module extends string>(
    graphName: string,
    fullGraph: Map<Module, Array<Module>>,
    heavyGraph: Map<Module, Array<Module>>,
    circular: Iterable<Module>,
    clusterize: (module: Module) => Array<Cluster>,
    baseCluster: Cluster,
    clusterLabel: (cluster: Cluster) => string,
  ): DependencyGraph<Cluster, Module> {
    return new DependencyGraph(
      graphName,
      fullGraph,
      heavyGraph,
      circular,
      clusterize,
      baseCluster,
      clusterLabel,
    );
  }

  private readonly _graphName: string;

  private readonly _graph: gv.RootGraphModel;

  private readonly _fullGraph: Map<M, Array<M>>;
  private readonly _heavyGraph: Map<M, Array<M>>;
  private readonly _trueCircular: Set<M>;

  private readonly _clusterize: (module: M) => Array<C>;
  private readonly _baseCluster: C;
  private readonly _clusterLabel: (cluster: C) => string;

  private readonly _edges: Array<[M, M]> = [];
  private readonly _clusterColors: Map<C, gv.Color>;

  protected constructor(
    graphName: string,
    fullGraph: Map<M, Array<M>>,
    heavyGraph: Map<M, Array<M>>,
    circular: Iterable<M>,
    clusterize: (module: M) => Array<C>,
    baseCluster: C,
    clusterLabel: (cluster: C) => string,
  ) {
    this._graphName = `dependency-graph-${graphName}`;

    this._heavyGraph = heavyGraph;

    this._fullGraph = fullGraph;
    this._trueCircular = Set.from(circular);

    this._graph = gv.digraph(this._graphName, { compound: true });

    this._clusterize = clusterize;
    this._baseCluster = baseCluster;
    this._clusterLabel = clusterLabel;

    this._clusterColors = Map.from(this.clustersColors());

    this.createGraph();
  }

  /**
   * Find all clusters, and assign a random color to each.
   */
  private clustersColors(): Array<[C, gv.Color]> {
    let clusters = Set.empty<C>().add(this._baseCluster);

    for (const module of this._fullGraph.keys()) {
      clusters = clusters.concat(this._clusterize(module));
    }

    const colors = Rainbow.rainbow(clusters.size);

    return clusters.toArray().map((c, i) => [c, colors[i]]);
  }

  /**
   * Get the color of a given cluster.
   */
  private clusterColor(id: C): gv.Color {
    return this._clusterColors.get(id).getOr("black");
  }

  /**
   * Create the options for the "name" node of a cluster.
   */
  private nameOptions(cluster: C): gv.NodeAttributesObject {
    return DependencyGraph.Options.Node.name(
      this._clusterLabel(cluster),
      this.clusterColor(cluster),
    );
  }

  /**
   * Get the light dependencies of a module, i.e. its dependencies in the full
   * graph minus the ones in the heavy graph.
   */
  private getLightDependencies(dep: M): Array<M> {
    const allDeps = this._fullGraph.get(dep).getOr([]);
    const trueDeps = this._heavyGraph.get(dep).getOr([]);

    return Array.subtract(allDeps, trueDeps);
  }

  /**
   * Check if an edge has already been registered.
   */
  private hasEdge(source: M, destination: M): boolean {
    return this._edges.some(([s, d]) => s === source && d === destination);
  }

  /**
   * Create a new GV cluster, if needed.
   * Returns the cluster and its exit node.
   *
   * @param cluster the cluster to create or fetch
   * @param parent the parent cluster
   * @param out the exit node of the parent cluster
   */
  private createCluster(
    cluster: C,
    [parent, out]: DependencyGraph.Cluster,
  ): DependencyGraph.Cluster {
    // Fetch or create the cluster as a subgraph of its parent.
    const gvCluster = parent.subgraph(
      `cluster_${clusterId(cluster)}`,
      DependencyGraph.Options.Node.cluster,
    );

    // Fetch or create the name and exit nodes for the cluster.
    gvCluster.node(`name_${cluster}`, this.nameOptions(cluster));
    const exit = gvCluster.node(
      `exit_${cluster}`,
      DependencyGraph.Options.Node.invisible,
    );

    // Create an invisible edge fron the (new) exit node to the (parent) exit node
    // This rigidifies the graph vertically.
    parent.createEdge([exit, out], DependencyGraph.Options.Node.invisible);

    return [gvCluster, exit];
  }

  /**
   * Creates nested GV clusters, under the given cluster, for each segment of a
   * path.
   *
   * @todo use cluster list, not path.
   */
  private nestedClusters(
    path: Array<string>,
    [cluster, exit]: DependencyGraph.Cluster,
  ): DependencyGraph.Cluster {
    for (let i = 0; i < path.length - 1; i++) {
      const id = path.slice(0, i + 1).join("/") as C;

      [cluster, exit] = this.createCluster(id, [cluster, exit]);
    }

    return [cluster, exit];
  }

  /**
   * Create (or fetch) a GV node corresponding to a module, including all nested
   * clusters.
   */
  private createNode(
    module: M,
    srcCluster: DependencyGraph.Cluster,
  ): [gv.GraphBaseModel, gv.NodeModel] {
    const path = module.split("/");

    const [cluster, exit] = this.nestedClusters(path, srcCluster);
    const node = cluster.node(module, {
      label: moduleName(module),
    });

    if (module.endsWith("index.ts")) {
      node.attributes.apply({
        color: this.clusterColor(
          (cluster.id ?? "src").replace("cluster_", "") as C,
        ),
        penwidth: 5,
      });
    }

    cluster.createEdge([node, exit], DependencyGraph.Options.Node.invisible);

    if (this._trueCircular.has(module)) {
      node.attributes.apply(DependencyGraph.Options.Node.circular);
    }

    return [cluster, node];
  }

  private createGraph() {
    // Create the base cluster to seed the graph.
    const baseCluster = this.createCluster(this._baseCluster, [
      this._graph,
      this._graph.node(this._graphName, DependencyGraph.Options.Node.invisible),
    ]);

    // For each module (file) in the directory
    for (const id of this._fullGraph.keys()) {
      // Create (or fetch) the corresponding node, including nested clusters.
      const [cluster, node] = this.createNode(id, baseCluster);

      const lightDeps = this.getLightDependencies(id);

      // for each dependency of the file, create an outward edge.
      for (const depId of this._fullGraph.get(id).getOr([])) {
        // First, make sure the dependency (node) exist
        const dep = this._graph.node(depId);

        // The actual edge lives in the first common ancestor, and is thus cut
        // at the last different ancestors.

        // Find the common ancestor
        const path = id.split("/");
        const depPath = depId.split("/");

        let shared = 0;
        while (path[shared] === depPath[shared]) {
          shared++;
        }

        // Find the cut points.
        const tail = path.slice(0, shared + 1).join("/") as M;
        const head = depPath.slice(0, shared + 1).join("/") as M;

        if (head.endsWith(".ts")) {
          // If the edge ends on an actual file (not a directory), we create an
          // invisible edge for the sake of rigidity, but we don't record it.
          // This notably ensure that when the edge starts from a directory, we
          // keep the true edge which rigidifies the graph inside the cluster.
          this._graph.createEdge(
            [node, dep],
            DependencyGraph.Options.Node.invisible,
          );
        }

        // If the edge already exists, create edge for rigidity, but hide it.
        let invisible = false;
        if (this.hasEdge(tail, head)) {
          invisible = true;
        }

        // Create the visible edge, and register it.
        // It's actual start and end point may differ from the true one if it is
        // cut, since we then go from the exit node to the name node of the
        // corresponding clusters (if needed).
        this._graph.createEdge(
          [
            tail.endsWith(".ts") ? node : this._graph.node(`exit_${tail}`),
            head.endsWith(".ts") ? dep : this._graph.node(`name_${head}`),
          ],
          invisible
            ? DependencyGraph.Options.Node.invisible
            : {
                style: lightDeps.includes(depId) ? "dotted" : "solid",
                ltail: `cluster_${tail}`,
                lhead: `cluster_${head}`,
                color:
                  // If both actual endpoints are files, this is internal
                  // to a given directory and doesn't need color.
                  // Otherwise, we grab the color of the (last) cluster containing
                  // the start (tail) of the edge
                  head.endsWith(".ts") && tail.endsWith(".ts")
                    ? "black"
                    : this.clusterColor(
                        (tail.endsWith(".ts")
                          ? (cluster.id ?? "src").replace("cluster_", "")
                          : tail) as C,
                      ),
              },
        );

        // Register this edge to avoid duplication.
        this._edges.push([tail, head]);
      }
    }
  }

  public async save(
    dirname: string,
    filename: string = "dependency-graph",
  ): Promise<void> {
    const dot = gv.toDot(this._graph);

    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    fs.writeFileSync(path.join(dirname, `${filename}.dot`), dot, "utf8");

    return adapter.toFile(dot, path.join(dirname, `${filename}.svg`), {
      ...DependencyGraph.Options.graphviz,
      format: "svg",
    });
  }
}

/**
 * @public
 */
export namespace DependencyGraph {
  export async function fromPackage(
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
      pkg.packageJson.name,
      Map.from(Object.entries(fullDepTree.obj())),
      Map.from(Object.entries(noTypeDepTree.obj())),
      Array.flatten(noTypeDepTree.circular()),
      clusterize,
      "src",
      clusterLabel,
    );
  }

  /**
   * @internal
   */
  export type Cluster = [cluster: gv.GraphBaseModel, exit: gv.NodeModel];

  /**
   * @internal
   */
  export namespace Options {
    export const graphviz: adapter.Options = {
      attributes: {
        graph: {
          overlap: false,
          pad: 0.3,
          rankdir: "TB",
          layout: "dot",
          bgcolor: "#ffffff",
        },
        edge: { color: "#151515" },
        node: {
          fontname: "Arial",
          fontsize: 14,
          color: "#000000",
          shape: "box",
          style: "rounded",
          height: 0,
          fontcolor: "#000000",
        },
      },
    };

    export namespace Node {
      export const circular: gv.NodeAttributesObject = {
        fillcolor: "#ff6c60",
        style: "rounded,filled",
      };
      export const cluster: gv.SubgraphAttributesObject = {
        color: "#000000",
        label: "",
      };
      export const invisible: gv.SubgraphAttributesObject = { style: "invis" };

      export function name(
        label: string,
        color: gv.Color,
      ): gv.NodeAttributesObject {
        return { penwidth: 5, shape: "rectangle", color, label };
      }
    }
  }
}

function clusterize(module: string): Array<string> {
  const clustersList = module.split("/");
  let clusters: Array<string> = [];

  for (let i = 0; i < clustersList.length - 1; i++) {
    clusters.push(clustersList.slice(0, i + 1).join("/"));
  }

  return clusters;
}

function clusterId(cluster: string): string {
  return cluster;
}

function clusterLabel(cluster: string): string {
  const parts = cluster.split("/");
  return parts[parts.length - 1];
}

function moduleName(module: string): string {
  const parts = module.split("/");
  return parts[parts.length - 1];
}
