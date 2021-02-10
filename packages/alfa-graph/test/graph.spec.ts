import { test } from "@siteimprove/alfa-test";

import { Graph } from "../src/graph";

// foo
// |- bar
// |- baz
//    |- foo
//       |- ...
const graph = Graph.from([
  ["foo", ["bar", "baz"]],
  ["bar", []],
  ["baz", ["foo"]],
]);

test("#connect() connects two nodes in a graph", (t) => {
  // foo
  // |- bar
  //    |- baz
  //       |- ...
  // |- baz
  //    |- foo
  //       |- ...
  t.deepEqual(graph.connect("bar", "baz").toArray(), [
    ["baz", ["foo"]],
    ["foo", ["baz", "bar"]],
    ["bar", ["baz"]],
  ]);
});

test("#disconnect() disconnects two nodes in a graph", (t) => {
  // foo
  // |- baz
  //    |- foo
  //       |- ...
  // bar
  t.deepEqual(graph.disconnect("foo", "bar").toArray(), [
    ["baz", ["foo"]],
    ["foo", ["baz"]],
    ["bar", []],
  ]);
});

test("#delete() removes a node from a graph", (t) => {
  // foo
  // |- baz
  //    |- foo
  //       |- ...
  t.deepEqual(graph.delete("bar").toArray(), [
    ["baz", ["foo"]],
    ["foo", ["baz"]],
  ]);
});

test("#traverse() traverses the subgraph rooted at a node", (t) => {
  t.deepEqual([...graph.traverse("baz")].sort(), ["baz", "foo", "bar"].sort());
});

test("#traverse() traverses the subgraph rooted at a node depth-first", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  // |- 5
  //    |- 6
  //    |- 7
  const graph = Graph.from([
    [1, [2, 5]],
    [2, [3, 4]],
    [5, [6, 7]],
  ]);

  t.deepEqual(
    [...graph.traverse(1, Graph.DepthFirst)],
    [
      1, // 1
      5, // |- 5
      7, //    |- 7
      6, //    |- 6
      2, // |- 2
      3, //    |- 3
      4, //    |- 4
    ]
  );
});

test("#traverse() traverses the subgraph rooted at a node breadth-first", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  // |- 5
  //    |- 6
  //    |- 7
  const graph = Graph.from([
    [1, [2, 5]],
    [2, [3, 4]],
    [5, [6, 7]],
  ]);

  t.deepEqual(
    [...graph.traverse(1, Graph.BreadthFirst)],
    [
      1, // 1
      2, // |- 2
      5, // |- 5
      4, //    |- 4
      3, //    |- 3
      6, //    |- 6
      7, //    |- 7
    ]
  );
});

test("#hasPath() checks if there's a path from one node to another", (t) => {
  // foo -> bar
  t.equal(graph.hasPath("foo", "bar"), true);

  // baz -> foo -> bar
  t.equal(graph.hasPath("baz", "bar"), true);

  // bar has no neighbors
  t.equal(graph.hasPath("bar", "baz"), false);

  // A node always has a path to itself
  for (const node of ["foo", "bar", "baz"]) {
    t.equal(graph.hasPath(node, node), true);
  }
});
