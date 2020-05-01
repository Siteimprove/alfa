import { test } from "@siteimprove/alfa-test";

import { Graph } from "../src/graph";

const graph = Graph.from([
  ["foo", ["bar", "baz"]],
  ["bar", []],
  ["baz", ["foo"]],
]);

test("#connect() connects two nodes in a graph", (t) => {
  t.deepEqual(graph.connect("bar", "baz").toArray(), [
    ["baz", ["foo"]],
    ["foo", ["baz", "bar"]],
    ["bar", ["baz"]],
  ]);
});

test("#disconnect() disconnects two nodes in a graph", (t) => {
  t.deepEqual(graph.disconnect("foo", "bar").toArray(), [
    ["baz", ["foo"]],
    ["foo", ["baz"]],
    ["bar", []],
  ]);
});

test("#delete() removes a node from a graph", (t) => {
  t.deepEqual(graph.delete("bar").toArray(), [
    ["baz", ["foo"]],
    ["foo", ["baz"]],
  ]);
});
