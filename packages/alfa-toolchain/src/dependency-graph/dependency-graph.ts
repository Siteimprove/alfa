import { Array } from "@siteimprove/alfa-array";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Set } from "@siteimprove/alfa-set";

import type { Package } from "@manypkg/get-packages";
import * as fs from "node:fs";
import madge from "madge";
import * as path from "node:path";
import * as gv from "ts-graphviz";
import * as adapter from "@ts-graphviz/adapter";

import { Rainbow } from "./rainbow.js";

interface Graph<C, M> {
  name: string;
  fullGraph: Map<M, Array<M>>;
  heavyGraph: Map<M, Array<M>>;
  circular: Iterable<M>;
  clusterize: (module: M) => Array<C>;
}

interface ClusterOptions<C> {
  baseCluster: C;
  clusterId: (cluster: C) => string;
  clusterLabel: (cluster: C) => string;
}

interface ModuleOptions<M> {
  moduleName: (module: M) => string;
  isEntryPoint: (module: M) => boolean;
}

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
    graph: Graph<Cluster, Module>,
    clusterOptions: ClusterOptions<Cluster>,
    moduleOptions: ModuleOptions<Module>,
  ): DependencyGraph<Cluster, Module> {
    return new DependencyGraph(graph, clusterOptions, moduleOptions);
  }

  private readonly _name: string;

  private readonly _gvGraph: gv.RootGraphModel;

  private readonly _fullGraph: Map<M, Array<M>>;
  private readonly _heavyGraph: Map<M, Array<M>>;
  private readonly _trueCircular: Set<M>;
  private readonly _clusterize: (module: M) => Array<C>;

  private readonly _baseCluster: C;
  private readonly _clusterId: (cluster: C) => string;
  private readonly _clusterLabel: (cluster: C) => string;

  private readonly _moduleName: (module: M) => string;
  private readonly _isEntryPoint: (module: M) => boolean;

  private _gvEdges: Map<C | M, Set<C | M>> = Map.empty();
  private readonly _clusterColors: Map<C, gv.Color>;

  // Prefixes for GV elements existing on each cluster.
  private readonly _clusterPrefix = "cluster_";
  private readonly _gvClusterId = (cluster: C) =>
    `${this._clusterPrefix}${this._clusterId(cluster)}`;
  private readonly _namePrefix = "name_";
  private readonly _gvNameNodeId = (cluster: C) =>
    `${this._namePrefix}${this._clusterId(cluster)}`;
  private readonly _exitPrefix = "exit_";
  private readonly _gvExitNodeId = (cluster: C) =>
    `${this._exitPrefix}${this._clusterId(cluster)}`;

  protected constructor(
    { name, fullGraph, heavyGraph, circular, clusterize }: Graph<C, M>,
    { baseCluster, clusterId, clusterLabel }: ClusterOptions<C>,
    { moduleName, isEntryPoint }: ModuleOptions<M>,
  ) {
    this._name = `dependency-graph-${name}`;

    this._heavyGraph = heavyGraph;

    this._fullGraph = fullGraph;
    this._trueCircular = Set.from(circular);

    this._gvGraph = gv.digraph(this._name, { compound: true });
    this._clusterize = clusterize;

    this._baseCluster = baseCluster;
    this._clusterId = clusterId;
    this._clusterLabel = clusterLabel;

    this._moduleName = moduleName;
    this._isEntryPoint = isEntryPoint;

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
  private clusterColor(cluster: C): gv.Color {
    return this._clusterColors.get(cluster).getOr("black");
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
   * Create the options for a module node.
   */
  private moduleOptions(module: M): gv.NodeAttributesObject {
    let options: gv.NodeAttributesObject = {
      label: this._moduleName(module),
    };

    if (this._isEntryPoint(module)) {
      options.color = this.clusterColor(
        (this._clusterize(module).pop() ?? this._baseCluster).replace(
          this._clusterPrefix,
          "",
        ) as C,
      );
      options.penwidth = 5;
    }

    if (this._trueCircular.has(module)) {
      options = { ...options, ...DependencyGraph.Options.Node.circular };
    }

    return options;
  }

  /**
   * Get the light dependencies of a module, i.e. its dependencies in the full
   * graph minus the ones in the heavy graph.
   */
  private getLightDependencies(dep: M): Array<M> {
    const allDeps = this._fullGraph.get(dep).getOr([]);
    const heavyDeps = this._heavyGraph.get(dep).getOr([]);

    return Array.subtract(allDeps, heavyDeps);
  }

  /**
   * Check if an edge has already been registered in the Graphviz graph.
   */
  private hasGVEdge(origin: C | M, destination: C | M): boolean {
    return (
      this._gvEdges
        .get(origin)
        // eta-expansion is needed to avoid binding issues
        .getOrElse(() => Set.empty())
        .has(destination)
    );
  }

  /**
   * Register an edge in the Graphviz graph.
   */
  private addGVEdge(origin: C | M, destination: C | M): void {
    this._gvEdges = this._gvEdges.set(
      origin,
      this._gvEdges
        .get(origin)
        // eta-expansion is needed to avoid binding issues
        .getOrElse(() => Set.empty<C | M>())
        .add(destination),
    );
  }

  /**
   * Create a new GV cluster, if needed.
   * Returns the cluster and its exit node.
   *
   * @param parent the parent cluster
   * @param out the exit node of the parent cluster
   * @param cluster the cluster to create or fetch
   */
  private createGVCluster(
    [parent, out]: DependencyGraph.Cluster,
    cluster: C,
  ): DependencyGraph.Cluster {
    // Fetch or create the cluster as a subgraph of its parent.
    const gvCluster = parent.subgraph(
      `${this._gvClusterId(cluster)}`,
      DependencyGraph.Options.Node.cluster,
    );

    // Fetch or create the name and exit nodes for the cluster.
    gvCluster.node(`${this._gvNameNodeId(cluster)}`, this.nameOptions(cluster));

    const exit = gvCluster.node(
      `${this._gvExitNodeId(cluster)}`,
      DependencyGraph.Options.Node.exit,
    );

    // Create an invisible edge fron the (new) exit node to the (parent) exit node
    // This rigidifies the graph vertically.
    parent.createEdge([exit, out], DependencyGraph.Options.Node.invisible);

    return [gvCluster, exit];
  }

  /**
   * Creates nested GV clusters, under the given cluster, for each segment of a
   * path.
   */
  private nestedClusters(
    clusters: Array<C>,
    parent: DependencyGraph.Cluster,
  ): DependencyGraph.Cluster {
    return Array.reduce(clusters, this.createGVCluster.bind(this), parent);
  }

  /**
   * Create (or fetch) a GV node corresponding to a module, including all nested
   * clusters.
   */
  private createGVNode(
    module: M,
    srcCluster: DependencyGraph.Cluster,
  ): DependencyGraph.Cluster {
    const [cluster, exit] = this.nestedClusters(
      this._clusterize(module),
      srcCluster,
    );
    const node = cluster.node(module, this.moduleOptions(module));

    // Create an invisible edge from the node to the exit node of its cluster,
    // this rigidifies the graph vertically.
    cluster.createEdge([node, exit], DependencyGraph.Options.Node.invisible);

    return [cluster, node];
  }

  private firstDifferentClusters(
    moduleA: M,
    moduleB: M,
  ): [Option<C>, Option<C>] {
    const clustersA = this._clusterize(moduleA);
    const clustersB = this._clusterize(moduleB);

    let i = 0;

    while (
      clustersA[i] === clustersB[i] &&
      i < clustersA.length &&
      i < clustersB.length
    ) {
      i++;
    }

    const firstA = i === clustersA.length ? None : Option.of(clustersA[i]);
    const firstB = i === clustersB.length ? None : Option.of(clustersB[i]);

    return [firstA, firstB];
  }

  private createGraph() {
    // Create the base cluster to seed the graph.
    const baseCluster = this.createGVCluster(
      [
        this._gvGraph,
        this._gvGraph.node(this._name, DependencyGraph.Options.Node.invisible),
      ],
      this._baseCluster,
    );

    // For each module (file) in the directory
    for (const module of this._fullGraph.keys()) {
      // Create (or fetch) the corresponding node, including nested clusters.
      const [gvCluster, gvNode] = this.createGVNode(module, baseCluster);

      const lightDeps = this.getLightDependencies(module);

      // for each dependency of the file, create an outward edge.
      for (const dep of this._fullGraph.get(module).getOr([])) {
        // First, make sure the dependency (node) exist
        const gvDep = this._gvGraph.node(dep);

        // The actual edge lives in the first common ancestor, and is thus cut
        // at the last different ancestors. These are called the "true" origin
        // and destination. They may be clusters, or the modules themselves in
        // case of intra-cluster edges.

        const [clusterOrigin, clusterDestination] = this.firstDifferentClusters(
          module,
          dep,
        );

        const trueOrigin = clusterOrigin.getOr(module);
        const trueDestination = clusterDestination.getOr(dep);

        if (clusterDestination.isNone() /*head */) {
          // The destination is inside the last common cluster. So, the edge
          // ends on it, without being cut.
          // This edge might be duplicated if the origin is inside a nested
          // cluster. So, we just create an invisible edge for rigidity and
          // will handle the actual edge later.
          this._gvGraph.createEdge(
            [gvNode, gvDep],
            DependencyGraph.Options.Node.invisible,
          );
        }

        // Moving origin and destination to the exit/name nodes if needed.
        // This ensures the inter-cluster edges start and end in "good" positions
        // instead of randomly being the first module that was seen in that
        // cluster.

        // If we have an origin cluster, i.e. the module is in a nested cluster
        // inside the last common one, we move the origin of the edge to the
        // exit node of that cluster.
        const gvEdgeOrigin = clusterOrigin.isSome()
          ? this._gvGraph.node(`${this._gvExitNodeId(clusterOrigin.get())}`)
          : gvNode;

        // If we have a destination cluster, i.e. the dependency is in a nested
        // cluster inside the last common one, we move the destination of the
        // edge to the name node of that cluster.
        const gvEdgeDestination = clusterDestination.isSome()
          ? this._gvGraph.node(
              `${this._gvNameNodeId(clusterDestination.get())}`,
            )
          : gvDep;

        let options: gv.EdgeAttributesObject = {
          style: lightDeps.includes(dep) ? "dotted" : "solid",
          color:
            // If both actual endpoints are modules, this is an intra-cluster
            // edge and doesn't need color.
            // Otherwise, we grab the color of the (last) cluster containing
            // the start (tail) of the edge
            clusterDestination.isNone() && clusterOrigin.isNone()
              ? "black"
              : this.clusterColor(
                  clusterOrigin.getOr(
                    (gvCluster.id ?? this._baseCluster).replace(
                      this._clusterPrefix,
                      "",
                    ),
                  ) as C,
                ),
        };

        // If there is already an edge between the true origin and destination,
        // we do not want to duplicate it. We will still create an invisible one
        // for rigidity.
        if (this.hasGVEdge(trueOrigin, trueDestination)) {
          options.style = "invis";
        }

        // If the edge is inter-cluster, we cut it to the edge of the first
        // different clusters.
        if (clusterDestination.isSome()) {
          options.lhead = this._gvClusterId(clusterDestination.get());
        }

        if (clusterOrigin.isSome()) {
          options.ltail = this._gvClusterId(clusterOrigin.get());
        }

        this._gvGraph.createEdge([gvEdgeOrigin, gvEdgeDestination], options);

        // Register this edge to avoid duplication.
        this.addGVEdge(trueOrigin, trueDestination);
      }
    }
  }

  public async save(
    dirname: string,
    filename: string = "dependency-graph",
  ): Promise<void> {
    const dot = gv.toDot(this._gvGraph);

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
      {
        name: pkg.packageJson.name,
        fullGraph: Map.from(Object.entries(fullDepTree.obj())),
        heavyGraph: Map.from(Object.entries(noTypeDepTree.obj())),
        circular: Array.flatten(noTypeDepTree.circular()),
        clusterize,
      },
      { baseCluster: "src", clusterId, clusterLabel },
      { moduleName, isEntryPoint },
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

      export const exit = invisible;

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

function isEntryPoint(module: string): boolean {
  return module.endsWith("index.ts");
}
