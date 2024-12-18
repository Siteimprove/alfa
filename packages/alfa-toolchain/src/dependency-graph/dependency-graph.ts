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
 *   are
 *   cut at directory limit, and de-duplicated.
 *   So, if foo/foo1.ts depends on bar/bar1.ts; and foo/foo2.ts depends on
 *   bar/bar2.ts, there will be only one edge from foo to bar. This de-clutter
 *   the graph.
 * * Each directory is also having an "exit" node (invisible). Edges that go
 *   out
 *   of that directory are effectively starting from this exit node (and cut at
 *   the directory limit). Each file within that directory has an invisible
 *   edge
 *   to the exit node.
 *   This serves two purpose: (i) the inter-directory edges start from a known
 *   position, not randomly one of the file in it, thus look like they connect
 *   to the cluster at a reasonable position; (ii) the invisible edges rigidify
 *   the structure and give less leeway to graphviz for placing nodes. This
 *   tends to give better visual results globally
 * * Each directory also has a "name" node that is visible and serve as an
 *   entry
 *   point for all edges connecting to that directory. This serves as having
 *   the
 *   inter-directory edges ending in a known position.
 * * Each directory is assigned a random color, evenly spaced on the "rainbow
 *   spectrum". The name node, the common.ts node, and all inter-directory edges
 *   inherit that color, as a visual help.
 * * Type dependencies are dotted.
 * * files forming a circular true dependency are colored in red; these should
 *   probably be investigated and de-entangled. In several case, this might
 *   just
 *   be an improperly stated type dependency.
 *
 * @public
 */
export class DependencyGraph {
  public static of(
    pkg: Package,
    fullDepTree: madge.MadgeInstance,
    noTypeDepTree: madge.MadgeInstance,
  ) {
    return new DependencyGraph(pkg, fullDepTree, noTypeDepTree);
  }

  private readonly _pkg: Package;

  private readonly _full: madge.MadgeInstance;
  private readonly _noType: madge.MadgeInstance;
  private readonly _graph: gv.RootGraphModel;

  private readonly _modules: madge.MadgeModuleDependencyGraph;
  private readonly _trueCircular: Set<string>;

  private readonly _edges: Array<[string, string]> = [];
  private readonly _clusters: Map<string, gv.Color>;

  protected constructor(
    pkg: Package,
    fullDepTree: madge.MadgeInstance,
    noTypeDepTree: madge.MadgeInstance,
  ) {
    this._full = fullDepTree;
    this._noType = noTypeDepTree;

    this._modules = this._full.obj();
    this._trueCircular = Set.from(Array.flatten(this._noType.circular()));

    this._pkg = pkg;
    this._graph = gv.digraph(`dependency-graph-${this._pkg}`, {
      compound: true,
    });

    this._clusters = Map.from(this.clustersColors());

    this.createGraph();
  }

  /**
   * Find all directories, and assign a random color to each.
   */
  private clustersColors(): Array<[string, gv.Color]> {
    let clusters = Set.empty<string>().add("src");

    for (const file of Object.keys(this._modules)) {
      const path = file.split("/");
      for (let i = 0; i < path.length - 1; i++) {
        clusters = clusters.add(path.slice(0, i + 1).join("/"));
      }
    }

    const colors = Rainbow.rainbow(clusters.size);

    return clusters.toArray().map((c, i) => [c, colors[i]]);
  }

  /**
   * Get the color of a given cluster.
   */
  private clusterColor(id: string): gv.Color {
    return this._clusters.get(id).getOr("black");
  }

  /**
   * Create the options for the "name" node of a cluster.
   *
   * @param id the full path to this dir (lorem/ispum/dolor)
   * @param dirname the last bit of the path, used as label (dolor)
   */
  private nameOptions(id: string, dirname: string): gv.NodeAttributesObject {
    return DependencyGraph.Options.Node.name(dirname, this.clusterColor(id));
  }

  /**
   * Get the type dependencies of a module, i.e. its dependencies in the full
   * graph minus the ones in the no-type graph.
   */
  private getTypeDependencies(dep: string): Array<string> {
    const allDeps = this._full.obj()[dep];
    const trueDeps = this._noType.obj()[dep];

    return Array.subtract(allDeps, trueDeps);
  }

  /**
   * Check if an edge has already been registered.
   */
  private hasEdge(source: string, destination: string): boolean {
    return this._edges.some(([s, d]) => s === source && d === destination);
  }

  /**
   * Create a new cluster (group of nodes), based on a directory.
   * Returns the cluster and its exit node.
   *
   * @param id the full path to this dir (lorem/ispum/dolor)
   * @param dirname the last bit of the path, used as label (dolor)
   * @param parent the parent cluster
   * @param out the exit node of the parent cluster
   */
  private createCluster(
    id: string,
    dirname: string,
    [parent, out]: DependencyGraph.Cluster,
  ): DependencyGraph.Cluster {
    const cluster = parent.subgraph(
      `cluster_${id}`,
      DependencyGraph.Options.Node.cluster,
    );

    cluster.node(`name_${id}`, this.nameOptions(id, dirname));
    const exit = cluster.node(
      `exit_${id}`,
      DependencyGraph.Options.Node.invisible,
    );

    parent.createEdge([exit, out], DependencyGraph.Options.Node.invisible);

    return [cluster, exit];
  }

  /**
   * Creates nested clusters, under the given cluster, for each segment of a
   * path.
   */
  private nestedClusters(
    path: Array<string>,
    [cluster, exit]: DependencyGraph.Cluster,
  ): DependencyGraph.Cluster {
    for (let i = 0; i < path.length - 1; i++) {
      const id = path.slice(0, i + 1).join("/");

      [cluster, exit] = this.createCluster(id, path[i], [cluster, exit]);
    }

    return [cluster, exit];
  }

  /**
   * Create a node corresponding (normally) to a file, including all nested
   * clusters for directories on the path.
   */
  private createNode(
    id: string,
    srcCluster: DependencyGraph.Cluster,
  ): [gv.GraphBaseModel, gv.NodeModel] {
    const path = id.split("/");

    const [cluster, exit] = this.nestedClusters(path, srcCluster);
    const node = cluster.node(id, {
      label: path[path.length - 1],
    });

    if (id.endsWith("index.ts")) {
      node.attributes.apply({
        color: this.clusterColor((cluster.id ?? "src").replace("cluster_", "")),
        penwidth: 5,
      });
    }

    cluster.createEdge([node, exit], DependencyGraph.Options.Node.invisible);

    if (this._trueCircular.has(id)) {
      node.attributes.apply(DependencyGraph.Options.Node.circular);
    }

    return [cluster, node];
  }
  private createGraph() {
    // Create the src cluster to seed the graph.
    const srcCluster = this.createCluster("src", "src", [
      this._graph,
      this._graph.node(
        `dependency-graph-${this._pkg}`,
        DependencyGraph.Options.Node.invisible,
      ),
    ]);

    // For each module (file) in the directory
    for (const id of Object.keys(this._modules)) {
      // Create (or fetch) the corresponding node, including nested clusters.
      const [cluster, node] = this.createNode(id, srcCluster);

      const typeDeps = this.getTypeDependencies(id);

      // for each dependency of the file, create an outward edge.
      for (const depId of this._modules[id]) {
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
        const tail = path.slice(0, shared + 1).join("/");
        const head = depPath.slice(0, shared + 1).join("/");

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
                style: typeDeps.includes(depId) ? "dotted" : "solid",
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
                        tail.endsWith(".ts")
                          ? (cluster.id ?? "src").replace("cluster_", "")
                          : tail,
                      ),
              },
        );

        // Register this edge to avoid duplication.
        this._edges.push([tail, head]);
      }
    }
  }

  public save() {
    const dot = gv.toDot(this._graph);
    const docDir = path.join(this._pkg.dir, "docs");

    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }

    fs.writeFileSync(path.join(docDir, "dependency-graph.dot"), dot, "utf8");

    return adapter.toFile(dot, path.join(docDir, "dependency-graph.svg"), {
      ...DependencyGraph.Options.graphviz,
      format: "svg",
    });
  }
}

/**
 * @public
 */
export namespace DependencyGraph {
  export async function from(pkg: Package): Promise<DependencyGraph> {
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

    return DependencyGraph.of(pkg, fullDepTree, noTypeDepTree);
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
