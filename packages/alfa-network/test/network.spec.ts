import { test } from "@siteimprove/alfa-test";

import { Network } from "../src/network";

// foo
// |- 1 => bar
// |- 2 => baz
//    |- 3 => foo
//       |- ...
const network = Network.from<string, number>([
  [
    "foo",
    [
      ["bar", [1]],
      ["baz", [2]],
    ],
  ],
  ["bar", []],
  ["baz", [["foo", [3]]]],
]);

test(".from() excludes connections with no edges", (t) => {
  t.deepEqual(
    Network.from<string, void>([["foo", [["bar", []]]]]).toArray(),
    [["foo", []]]
  );
});

test("#connect() connects two nodes in a network", (t) => {
  // foo
  // |- 1 => bar
  //    |- 4 => baz
  //       |- ...
  // |- 2 => baz
  //    |- 3 => foo
  //       |- ...
  t.deepEqual(network.connect("bar", "baz", 4).toArray(), [
    ["baz", [["foo", [3]]]],
    [
      "foo",
      [
        ["baz", [2]],
        ["bar", [1]],
      ],
    ],
    ["bar", [["baz", [4]]]],
  ]);

  // foo
  // |- 1 => bar
  // |- 2 => baz
  //    |- 3 => foo
  //       |- ...
  // |- 4 => baz
  //    |- ...
  t.deepEqual(network.connect("foo", "baz", 4).toArray(), [
    ["baz", [["foo", [3]]]],
    [
      "foo",
      [
        ["baz", [4, 2]],
        ["bar", [1]],
      ],
    ],
    ["bar", []],
  ]);
});

test("#disconnect() disconnects two nodes in a network", (t) => {
  // foo
  // |- 2 => baz
  //    |- 3 => foo
  //       |- ...
  // bar
  t.deepEqual(network.disconnect("foo", "bar").toArray(), [
    ["baz", [["foo", [3]]]],
    ["foo", [["baz", [2]]]],
    ["bar", []],
  ]);

  // foo
  // |- 1 => bar
  //
  // baz
  // |- 3 => foo
  //    |- ...
  t.deepEqual(
    network.connect("foo", "baz", 4).disconnect("foo", "baz").toArray(),
    [
      ["baz", [["foo", [3]]]],
      ["foo", [["bar", [1]]]],
      ["bar", []],
    ]
  );

  // foo
  // |- 1 => bar
  // |- 4 => baz
  //    |- 3 => foo
  //       |- ...
  t.deepEqual(
    network.connect("foo", "baz", 4).disconnect("foo", "baz", 2).toArray(),
    [
      ["baz", [["foo", [3]]]],
      [
        "foo",
        [
          ["baz", [4]],
          ["bar", [1]],
        ],
      ],
      ["bar", []],
    ]
  );
});

test("#delete() removes a node from a network", (t) => {
  // foo
  // |- 2 => baz
  //    |- 1 => foo
  //       |- ...
  t.deepEqual(network.delete("bar").toArray(), [
    ["baz", [["foo", [3]]]],
    ["foo", [["baz", [2]]]],
  ]);
});

test("#traverse() traverses the subnetwork rooted at a node", (t) => {
  t.deepEqual(
    [...network.traverse("baz")].sort(),
    ["baz", "foo", "bar"].sort()
  );
});

test("#traverse() traverses the subnetwork rooted at a node depth-first", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  // |- 5
  //    |- 6
  //    |- 7
  const network = Network.from<number, boolean>([
    [
      1,
      [
        [2, [true]],
        [5, [true]],
      ],
    ],
    [
      2,
      [
        [3, [true]],
        [4, [true]],
      ],
    ],
    [
      5,
      [
        [6, [true]],
        [7, [true]],
      ],
    ],
  ]);

  t.deepEqual(
    [...network.traverse(1, Network.DepthFirst)],
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

test("#traverse() traverses the subnetwork rooted at a node breadth-first", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  // |- 5
  //    |- 6
  //    |- 7
  const network = Network.from<number, boolean>([
    [
      1,
      [
        [2, [true]],
        [5, [true]],
      ],
    ],
    [
      2,
      [
        [3, [true]],
        [4, [true]],
      ],
    ],
    [
      5,
      [
        [6, [true]],
        [7, [true]],
      ],
    ],
  ]);

  t.deepEqual(
    [...network.traverse(1, Network.BreadthFirst)],
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
  t.equal(network.hasPath("foo", "bar"), true);

  // baz -> foo -> bar
  t.equal(network.hasPath("baz", "bar"), true);

  // bar has no neighbors
  t.equal(network.hasPath("bar", "baz"), false);

  // A node always has a path to itself
  for (const node of ["foo", "bar", "baz"]) {
    t.equal(network.hasPath(node, node), true);
  }
});
