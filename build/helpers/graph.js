// @ts-check

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

    this.edges.get(from).add(to);

    return true;
  }

  /**
   * @param {string} from
   * @param {string} to
   * @return {boolean}
   */
  hasEdge(from, to) {
    return this.edges.has(from) && this.edges.get(from).has(to);
  }

  /**
   * @see https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
   */
  sort() {
    /** @type {Array<string>} */
    const result = [];

    /** @type {Map<string, number>} */
    const indegrees = new Map();

    for (const [node, neighbours] of this.edges) {
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

    while (leaves.length > 0) {
      const next = leaves.pop();

      result.unshift(next);

      for (const node of this.edges.get(next)) {
        const indegree = indegrees.get(node) - 1;

        indegrees.set(node, indegree)

        if (indegree === 0) {
          leaves.push(node);
        }
      }
    }

    return result;
  }
}

module.exports = { Graph };
