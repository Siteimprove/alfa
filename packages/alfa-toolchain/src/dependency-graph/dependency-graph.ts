import { Array } from "@siteimprove/alfa-array";
import { Map } from "@siteimprove/alfa-map";
import { Set } from "@siteimprove/alfa-set";

import * as fs from "fs";
import * as madge from "madge";
import * as gv from "ts-graphviz";
import * as adapter from "ts-graphviz/adapter";
import { Rainbow } from "./rainbow";

/**
 * @public
 */
export class DependencyGraph {
  public static async of(pkg: string) {
    const fullDepTree = await madge(`packages/alfa-${pkg}/src`, {
      fileExtensions: ["ts", "tsx"],
      excludeRegExp: [/[.]d[.]ts/, new RegExp(`alfa-(?!${pkg})`)],
    });

    const noTypeDepTree = await madge(`packages/alfa-${pkg}/src`, {
      fileExtensions: ["ts", "tsx"],
      excludeRegExp: [/[.]d[.]ts/, new RegExp(`alfa-(?!${pkg})`)],
      detectiveOptions: { ts: { skipTypeImports: true } },
    });

    return new DependencyGraph(pkg, fullDepTree, noTypeDepTree);
  }

  private readonly _pkg: string;

  private readonly _full: madge.MadgeInstance;
  private readonly _noType: madge.MadgeInstance;
  private readonly _graph: gv.RootGraphModel;

  private readonly _modules: madge.MadgeModuleDependencyGraph;
  private readonly _trueCircular: Set<string>;

  private readonly _edges: Array<[string, string]> = [];
  private readonly _clusters: Map<string, gv.Color>;

  private constructor(
    pkg: string,
    fullDepTree: madge.MadgeInstance,
    noTypeDepTree: madge.MadgeInstance,
  ) {
    this._full = fullDepTree;
    this._noType = noTypeDepTree;

    this._modules = this._full.obj();
    this._trueCircular = Set.from(Array.flatten(this._noType.circular()));

    this._pkg = pkg;
    this._graph = gv.digraph(`dependency-graph-alfa-${this._pkg}`, {
      compound: true,
    });

    // Find all directories, and assign a random color to each.
    let clusters = Set.empty<string>().add("src");
    for (const file of Object.keys(this._modules)) {
      const path = file.split("/");
      for (let i = 0; i < path.length - 1; i++) {
        clusters = clusters.add(path.slice(0, i + 1).join("/"));
      }
    }

    const colors = Rainbow.rainbow(clusters.size);
    this._clusters = Map.from(clusters.toArray().map((c, i) => [c, colors[i]]));

    this.createCluster("src", "src", [this._graph, undefined]);
    this.createGraph();
  }

  private getTypeDependencies(dep: string): Array<string> {
    const allDeps = this._full.obj()[dep];
    const trueDeps = this._noType.obj()[dep];

    return Array.subtract(allDeps, trueDeps);
  }

  private setNodeColor(node: gv.NodeModel, color: gv.Color) {
    node.attributes.set("fillcolor", color);
    node.attributes.set("style", "rounded,filled");
  }

  private hasEdge(source: string, destination: string): boolean {
    return this._edges.some(([s, d]) => s === source && d === destination);
  }

  /**
   * Create a new cluster (group of nodes, used for each directory).
   * Returns the cluster and its exit node.
   *
   * @param id the full path to this dir (lorem/ispum/dolor)
   * @param dirname the last bit of the path, used as label (dolor)
   * @param parent the parent cluster
   * @param out the exit node of the parent cluster
   *
   * @remarks
   * Each cluster has a name node and an exit node. The exit node is invisible
   * and serves as a way to tighten and rigidify the full graph, giving a
   * globally nicer visualisation.
   */
  private createCluster(
    id: string,
    dirname: string,
    [parent, out]: [gv.GraphBaseModel, gv.NodeModel | undefined],
  ): [gv.SubgraphModel, gv.NodeModel] {
    const cluster = parent.subgraph(`cluster_${id}`, {
      ...DependencyGraph.Options.Node.cluster,
    });

    cluster.node(`name_${id}`, {
      ...DependencyGraph.Options.Node.withLabel(dirname),
      color: this._clusters.get(id).getOr("black"),
    });
    const exit = cluster.node(`exit_${id}`, { style: "invis" });

    if (out !== undefined) {
      parent.createEdge([exit, out], { style: "invis" });
    }

    return [cluster, exit];
  }

  /**
   * Creates nested clusters for each segment of a path.
   */
  private nestedClusters(
    path: Array<string>,
  ): [gv.SubgraphModel, gv.NodeModel | undefined] {
    let cluster = this._graph.subgraph("cluster_src");
    let exit: gv.NodeModel | undefined = undefined;

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
  private createNode(id: string): gv.NodeModel {
    const path = id.split("/");

    const [cluster, exit] = this.nestedClusters(path);
    const node = cluster.node(id, {
      label: path[path.length - 1],
    });

    if (exit !== undefined) {
      cluster.createEdge([node, exit], { style: "invis" });
    }

    if (this._trueCircular.has(id)) {
      this.setNodeColor(node, DependencyGraph.Options.Node.circular);
    }

    return node;
  }
  private createGraph() {
    for (const id of Object.keys(this._modules)) {
      const node = this.createNode(id);
      if (id.endsWith("index.ts")) {
        node.attributes.set(
          "color",
          this._clusters
            .get(id.split("/").slice(0, -1).join("/"))
            .getOrElse(() => this._clusters.get("src").getUnsafe()),
        );
        node.attributes.set("penwidth", 5);
      }

      const typeDeps = this.getTypeDependencies(id);

      for (const depId of this._modules[id]) {
        // for each dependency of the file, create an outward edge.

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
          this._graph.createEdge([node, dep], { style: "invis" });
        }

        // If the edge already exists, create edge for rigidity, but hide it.
        let invisible = false;
        if (this.hasEdge(tail, head)) {
          invisible = true;
        }

        // Create the visible edge, and register it.
        this._graph.createEdge(
          [
            tail.endsWith(".ts") ? node : this._graph.node(`exit_${tail}`),
            head.endsWith(".ts") ? dep : this._graph.node(`name_${head}`),
          ],
          invisible
            ? { style: "invis" }
            : {
                style: typeDeps.includes(depId) ? "dotted" : "solid",
                ltail: `cluster_${tail}`,
                lhead: `cluster_${head}`,
                color:
                  head.endsWith(".ts") && tail.endsWith(".ts")
                    ? "black"
                    : tail.endsWith(".ts")
                      ? this._clusters
                          .get(id.split("/").slice(0, -1).join("/"))
                          .getOrElse(() =>
                            this._clusters.get("src").getUnsafe(),
                          )
                      : this._clusters.get(tail).getOr("black"),
              },
        );

        this._edges.push([tail, head]);
      }
    }
  }

  public save() {
    const dot = gv.toDot(this._graph);

    fs.writeFileSync(`./test-${this._pkg}.dot`, dot, "utf8");

    return adapter.toFile(dot, `./test-${this._pkg}.svg`, {
      ...DependencyGraph.Options.graphviz,
      format: "svg",
    });
  }
}

/**
 * @public
 */
export namespace DependencyGraph {
  export namespace Options {
    export const graphviz: adapter.Options = {
      attributes: {
        // Graph
        graph: {
          overlap: false,
          pad: 0.3,
          rankdir: "TB",
          layout: "dot",
          bgcolor: "#ffffff",
        },
        // Edge
        edge: { color: "#151515" },
        // Node
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
      export const circular: gv.Color = "#ff6c60";
      export const cluster: gv.SubgraphAttributesObject = {
        color: "#000000",
        label: "",
      };
      export const name: gv.NodeAttributesObject = {
        penwidth: 5,
        shape: "rectangle",
      };

      export function withLabel(label: string): gv.NodeAttributesObject {
        return { ...name, label };
      }
    }
  }
}
