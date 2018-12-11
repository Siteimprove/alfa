class Graph {
  constructor() {
    /** @type {Set<string>} */
    this.nodes = new Set();

    /** @type {Map<string, { incoming: Set<string>, outgoing: Set<string> }>} */
    this.edges = new Map();
  }

  /**
   * @param {string} node
   * @return {boolean}
   */
  addNode(node) {
    if (this.hasNode(node)) {
      return false;
    }

    this.nodes.add(node);
    this.edges.set(node, {
      incoming: new Set(),
      outgoing: new Set()
    });

    return true;
  }

  /**
   * @param {string} node
   * @return {boolean}
   */
  removeNode(node) {
    if (!this.hasNode(node)) {
      return false;
    }

    const edges = this.edges.get(node);

    if (edges !== undefined) {
      for (const neighbour of edges.incoming) {
        this.removeEdge(neighbour, node);
      }
    }

    this.nodes.delete(node);
    this.edges.delete(node);

    return true;
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  hasNode(name) {
    return this.nodes.has(name);
  }

  /**
   * @param {string} from
   * @param {string} to
   * @return {boolean}
   */
  addEdge(from, to) {
    if (this.hasEdge(from, to)) {
      return false;
    }

    this.addNode(from);
    this.addNode(to);

    {
      const edges = this.edges.get(from);

      if (edges !== undefined) {
        edges.outgoing.add(to);
      }
    }

    {
      const edges = this.edges.get(to);

      if (edges !== undefined) {
        edges.incoming.add(from);
      }
    }

    return true;
  }

  /**
   * @param {string} from
   * @param {string} to
   * @return {boolean}
   */
  removeEdge(from, to) {
    if (!this.hasEdge(from, to)) {
      return false;
    }

    {
      const edges = this.edges.get(from);

      if (edges !== undefined) {
        edges.outgoing.delete(to);
      }
    }

    {
      const edges = this.edges.get(to);

      if (edges !== undefined) {
        edges.incoming.delete(from);
      }
    }

    return true;
  }

  /**
   * @param {string} from
   * @param {string} to
   * @return {boolean}
   */
  hasEdge(from, to) {
    const edges = this.edges.get(from);

    if (edges === undefined) {
      return false;
    }

    return edges.outgoing.has(to);
  }

  /**
   * @see https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
   */
  sort() {
    /** @type {Array<string>} */
    const result = [];

    /** @type {Map<string, number>} */
    const indegrees = new Map();

    for (const node of this.nodes.values()) {
      const edges = this.edges.get(node);

      if (edges !== undefined) {
        indegrees.set(node, edges.incoming.size);
      }
    }

    const leaves = Array.from(this.nodes).filter(
      node => indegrees.get(node) === 0
    );

    let next = leaves.pop();

    while (next !== undefined) {
      result.unshift(next);

      const edges = this.edges.get(next);

      if (edges !== undefined) {
        for (const node of edges.outgoing) {
          const indegree = indegrees.get(node);

          if (indegree === undefined) {
            continue;
          }

          indegrees.set(node, indegree - 1);

          if (indegree === 1) {
            leaves.push(node);
          }
        }
      }

      next = leaves.pop();
    }

    return result;
  }
}

exports.Graph = Graph;
