class Graph {
  constructor() {
    /** @type {Set<string>} */
    this.nodes = new Set();

    /** @type {Map<string, Set<string>>} */
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
    this.edges.set(node, new Set());

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

    const edges = this.edges.get(from);

    if (edges !== undefined) {
      edges.add(to);
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

    return edges.has(to);
  }

  /**
   * @see https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
   */
  sort() {
    /** @type {Array<string>} */
    const result = [];

    /** @type {Map<string, number>} */
    const indegrees = new Map();

    for (const neighbours of this.edges.values()) {
      for (const node of neighbours) {
        const indegree = indegrees.get(node);

        if (indegree === undefined) {
          indegrees.set(node, 1);
        } else {
          indegrees.set(node, indegree + 1);
        }
      }
    }

    const leaves = Array.from(this.nodes).filter(
      node => indegrees.get(node) === undefined
    );

    let next = leaves.pop();

    while (next !== undefined) {
      result.unshift(next);

      const edges = this.edges.get(next);

      for (const node of edges || []) {
        const indegree = indegrees.get(node);

        if (indegree === undefined) {
          continue;
        }

        indegrees.set(node, indegree - 1);

        if (indegree === 1) {
          leaves.push(node);
        }
      }

      next = leaves.pop();
    }

    return result;
  }
}

exports.Graph = Graph;
