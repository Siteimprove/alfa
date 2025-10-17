/**
 * A dependency graph is built from modules (packages, files, …)
 *
 * To avoid too many edges between modules, they are grouped into clusters,
 * typically directories containing the files. Edges are cut at cluster
 * boundaries, and de-duped if this would result in the same edge.
 * Otherwise, we would have, e.g., all files in foo/*.ts depending on
 * utilities/index.ts, making the graph even less readable.
 * This creates a lot of complexity in building the graph…
 *
 * First, we need a way to know which (nested) clusters a module belongs to.
 * Next, while Graphviz/dot can cut edges at arbitrary clusters, they would
 * still originate (and go) to the real origin that was defined (the module).
 * This would result in edges originating and going to random points along the
 * clusters boundaries. To avoid that, we create abstract "name" and "exit"
 * nodes in each cluster, corresponding to no module, but used for endpoint of
 * edges that are cut at that clusters' boundaries.
 * Lastly, we need to record which cluster-to-cluster edge has been created to
 * avoid duplicating it.
 *
 * We also add a few extra edges between "exit" nodes of a cluster and its
 * parent in order to rigidify the graph and obtain a nicer visualisation.
 *
 * Finally, both the abstract graph (our model) and the Graphviz one share a lot
 * of common vocabulary (nodes, edges, clusters, …), which makes the code
 * a bit hard to read. We try to prefix Graphviz-related elements with "gv" to
 * help a bit.
 */

import { Array } from "@siteimprove/alfa-array";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Set } from "@siteimprove/alfa-set";

import * as gv from "ts-graphviz";
import * as adapter from "@ts-graphviz/adapter";

import * as fs from "node:fs";
import * as path from "node:path";

import { Rainbow } from "./rainbow.js";

/**
 * Parameters for building a dependency graph.
 *
 * @remarks
 * A graph contains both "light" and "heavy" edges, that are displayed
 * differently.
 * Light edges correspond typically to type dependencies and are not used to
 * detect circular references.
 */
interface Graph<C, M> {
  name: string;
  // The full graph, both light and heavy edges.
  fullGraph: Map<M, Array<M>>;
  // The heavy graph, without light edges.
  heavyGraph: Map<M, Array<M>>;
  // The modules that are part of a true circular dependency (in the heavy graph).
  circular: Iterable<M>;
  // Function to get the clusters a module belongs to, from the outermost to
  // the innermost.
  clusterize: (module: M) => Array<C>;
}

/**
 * Parameters related to clusters in the graph
 */
interface ClusterOptions<C> {
  // The root cluster in which everything else lives.
  baseCluster: C;
  // Functions to get the id and label (name) of a cluster.
  clusterId: (cluster: C) => string;
  clusterLabel: (cluster: C) => string;
}

interface ModuleOptions<M> {
  // Functions to get the id and name of a module
  moduleId: (module: M) => string;
  moduleName: (module: M) => string;
  // Whether a module is the "entry point" for its cluster. Typically, the
  // index file of a directory.
  isEntryPoint: (module: M) => boolean;
}

/**
 * Build a Graphviz graph from a dependency graph.
 *
 * @public
 */
export class DependencyGraph<C, M> {
  public static of<Cluster, Module>(
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

  private readonly _moduleId: (module: M) => string;
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
    { moduleId, moduleName, isEntryPoint }: ModuleOptions<M>,
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

    this._moduleId = moduleId;
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
      // Entry points are highlighted with the color of their cluster.
      options.color = this.clusterColor(
        this._clusterize(module).pop() ?? this._baseCluster,
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
   * Get or create a GV cluster corresponding to a given cluster, inside the
   * gvParent.
   */
  private getGVCluster(
    parent: gv.GraphBaseModel,
    cluster: C,
  ): DependencyGraph.Cluster<C> {
    return [
      cluster,
      parent.subgraph(
        this._gvClusterId(cluster),
        DependencyGraph.Options.Node.cluster,
      ),
    ];
  }

  /**
   * Get or create the "name" node of a cluster.
   */
  private getNameNode([
    cluster,
    gvCluster,
  ]: DependencyGraph.Cluster<C>): gv.NodeModel {
    return gvCluster.node(
      this._gvNameNodeId(cluster),
      this.nameOptions(cluster),
    );
  }

  /**
   * Get or create the "exit" node of a cluster.
   */
  private getExitNode([
    cluster,
    gvCluster,
  ]: DependencyGraph.Cluster<C>): gv.NodeModel {
    return gvCluster.node(
      this._gvExitNodeId(cluster),
      DependencyGraph.Options.Node.exit,
    );
  }

  /**
   * Create a new GV cluster, if needed.
   * Returns the cluster and its exit node.
   *
   * @remarks
   * The order of parameters allows for easier Array.reduce.
   */
  private createGVCluster(
    [parent, gvParent]: DependencyGraph.Cluster<C>,
    cluster: C,
  ): DependencyGraph.Cluster<C> {
    const graphCluster = this.getGVCluster(gvParent, cluster);

    // Creates the "name" node.
    this.getNameNode(graphCluster);

    const exit = this.getExitNode(graphCluster);

    // Create an invisible edge fron the (new) exit node to the (parent) exit node
    // This rigidifies the graph vertically.
    gvParent.createEdge(
      [exit, this.getExitNode([parent, gvParent])],
      DependencyGraph.Options.Node.invisible,
    );

    return graphCluster;
  }

  /**
   * Creates nested GV clusters, under the given cluster.
   */
  private nestedClusters(
    clusters: Array<C>,
    parent: DependencyGraph.Cluster<C>,
  ): DependencyGraph.Cluster<C> {
    return Array.reduce(clusters, this.createGVCluster.bind(this), parent);
  }

  /**
   * Create (or fetch) a GV node corresponding to a module, including all nested
   * clusters.
   */
  private createGVNode(
    module: M,
    rootCluster: DependencyGraph.Cluster<C>,
  ): [DependencyGraph.Cluster<C>, node: gv.NodeModel] {
    const [cluster, gvCluster] = this.nestedClusters(
      this._clusterize(module),
      rootCluster,
    );
    const node = gvCluster.node(
      this._moduleId(module),
      this.moduleOptions(module),
    );

    // Create an invisible edge from the node to the exit node of its cluster,
    // this rigidifies the graph vertically.
    gvCluster.createEdge(
      [node, this.getExitNode([cluster, gvCluster])],
      DependencyGraph.Options.Node.invisible,
    );

    return [[cluster, gvCluster], node];
  }

  /**
   * Find the first different clusters between two modules.
   */
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

  /**
   * Creates the full Graphviz graph.
   */
  private createGraph() {
    // Create the base cluster to seed the graph.
    const baseCluster: DependencyGraph.Cluster<C> = this.getGVCluster(
      this._gvGraph,
      this._baseCluster,
    );

    // For each module in the graph
    for (const module of this._fullGraph.keys()) {
      // Create (or fetch) the corresponding node, including nested clusters.
      const [[cluster], gvNode] = this.createGVNode(module, baseCluster);

      const lightDeps = this.getLightDependencies(module);

      // for each dependency of the module, create an outward edge.
      for (const dep of this._fullGraph.get(module).getOr([])) {
        // First, make sure the dependency (node) exist in the GV graph.
        const gvDep = this._gvGraph.node(this._moduleId(dep));

        // The actual edge lives in the last common cluster, and is thus cut
        // at the first different clusters. These are called the "true" origin
        // and destination. They may be clusters, or the modules themselves in
        // case of intra-cluster edges.

        const [clusterOrigin, clusterDestination] = this.firstDifferentClusters(
          module,
          dep,
        );

        const trueOrigin = clusterOrigin.getOr(module);
        const trueDestination = clusterDestination.getOr(dep);

        if (clusterDestination.isNone()) {
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
          ? this._gvGraph.node(this._gvExitNodeId(clusterOrigin.get()))
          : gvNode;

        // If we have a destination cluster, i.e. the dependency is in a nested
        // cluster inside the last common one, we move the destination of the
        // edge to the name node of that cluster.
        const gvEdgeDestination = clusterDestination.isSome()
          ? this._gvGraph.node(this._gvNameNodeId(clusterDestination.get()))
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
                  clusterOrigin.getOr(cluster ?? this._baseCluster),
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

  /**
   * Saves the dependency graph, both as .dot ad .svg files.
   */
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
  /**
   * @internal
   */
  export type Cluster<C> = [cluster: C, gvCluster: gv.GraphBaseModel];

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
