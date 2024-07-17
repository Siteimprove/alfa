import { test } from "@siteimprove/alfa-test";

import { Graph } from "../dist/graph.js";

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
  t.deepEqual(graph.traverse("baz").toJSON(), [
    ["foo", "baz"],
    ["bar", "foo"],
  ]);
});

test("#traverse() traverses the subgraph rooted at a node depth-first", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  //       |- 2 (cycle)
  // |- 5
  //    |- 6
  //    |- 7
  //       |- 1 (cycle)
  const graph = Graph.from([
    [1, [2, 5]],
    [2, [3, 4]],
    [4, [2]],
    [5, [6, 7]],
    [7, [1]],
  ]);

  t.deepEqual(graph.traverse(1, Graph.DepthFirst).toJSON(), [
    [5, 1], // |- 5
    [6, 5], //    |- 6
    [7, 5], //    |- 7
    [2, 1], // |- 2
    [4, 2], //    |- 4
    [3, 2], //    |- 3
  ]);
});

test("#traverse() traverses the subgraph rooted at a node breadth-first", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  //       |- 2 (cycle)
  // |- 5
  //    |- 6
  //    |- 7
  //       |- 1 (cycle)
  const graph = Graph.from([
    [1, [2, 5]],
    [2, [3, 4]],
    [4, [2]],
    [5, [6, 7]],
    [7, [1]],
  ]);

  t.deepEqual(graph.traverse(1, Graph.BreadthFirst).toJSON(), [
    [2, 1], // |- 2
    [5, 1], // |- 5
    [3, 2], //    |- 3
    [4, 2], //    |- 4
    [7, 5], //    |- 7
    [6, 5], //    |- 6
  ]);
});

test("#path() returns the path from one node to another", (t) => {
  // foo -> bar
  t.deepEqual(graph.path("foo", "bar").toJSON(), ["bar"]);

  // baz -> foo -> bar
  t.deepEqual(graph.path("baz", "bar").toJSON(), ["foo", "bar"]);

  // bar has no neighbors
  t.deepEqual(graph.path("bar", "baz").toJSON(), []);
});

test("#hasPath() checks if there's a path from one node to another", (t) => {
  // foo -> bar
  t.equal(graph.hasPath("foo", "bar"), true);

  // baz -> foo -> bar
  t.equal(graph.hasPath("baz", "bar"), true);

  // bar has no neighbors
  t.equal(graph.hasPath("bar", "baz"), false);
});

test("#sort() topologically sorts an acyclic graph", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  //       |- 3
  // 5
  // |- 4
  const graph = Graph.from([
    [1, [2]],
    [2, [3, 4]],
    [4, [3]],
    [5, [4]],
  ]);

  t.deepEqual([...graph.sort()], [5, 1, 2, 4, 3]);
});

test("#sort() yields nothing for a cyclic graph", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  //       |- 1
  const graph = Graph.from([
    [1, [2]],
    [2, [3, 4]],
    [4, [1]],
  ]);

  t.deepEqual([...graph.sort()], []);
});
