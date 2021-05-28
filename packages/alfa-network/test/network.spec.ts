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
  t.deepEqual(network.traverse("baz").toJSON(), [
    ["foo", [3], "baz"],
    ["bar", [1], "foo"],
  ]);
});

test("#traverse() traverses the subnetwork rooted at a node depth-first", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  //       |- 2 (cycle)
  // |- 5
  //    |- 6
  //    |- 7
  //       |- 1 (cycle)
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
    [4, [[2, [true]]]],
    [
      5,
      [
        [6, [true]],
        [7, [true]],
      ],
    ],
    [7, [[1, [true]]]],
  ]);

  t.deepEqual(network.traverse(1, Network.DepthFirst).toJSON(), [
    [5, [true], 1], // |- 5
    [7, [true], 5], //    |- 7
    [6, [true], 5], //    |- 6
    [2, [true], 1], // |- 2
    [3, [true], 2], //    |- 3
    [4, [true], 2], //    |- 4
  ]);
});

test("#traverse() traverses the subnetwork rooted at a node breadth-first", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  //       |- 2 (cycle)
  // |- 5
  //    |- 6
  //    |- 7
  //       |- 1 (cycle)
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
    [4, [[2, [true]]]],
    [
      5,
      [
        [6, [true]],
        [7, [true]],
      ],
    ],
    [7, [[1, [true]]]],
  ]);

  t.deepEqual(network.traverse(1, Network.BreadthFirst).toJSON(), [
    [2, [true], 1], // |- 2
    [5, [true], 1], // |- 5
    [4, [true], 2], //    |- 4
    [3, [true], 2], //    |- 3
    [6, [true], 5], //    |- 6
    [7, [true], 5], //    |- 7
  ]);
});

test("#path() returns the path from one node to another", (t) => {
  // foo -> bar
  t.deepEqual(network.path("foo", "bar").toJSON(), [["bar", [1]]]);

  // baz -> foo -> bar
  t.deepEqual(network.path("baz", "bar").toJSON(), [
    ["foo", [3]],
    ["bar", [1]],
  ]);

  // bar has no neighbors
  t.deepEqual(network.path("bar", "baz").toJSON(), []);
});

test("#hasPath() checks if there's a path from one node to another", (t) => {
  // foo -> bar
  t.equal(network.hasPath("foo", "bar"), true);

  // baz -> foo -> bar
  t.equal(network.hasPath("baz", "bar"), true);

  // bar has no neighbors
  t.equal(network.hasPath("bar", "baz"), false);
});

test("#sort() topologically sorts an acyclic network", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  //       |- 3
  // 5
  // |- 4
  const network = Network.from<number, boolean>([
    [1, [[2, [true]]]],
    [
      2,
      [
        [3, [true]],
        [4, [true]],
      ],
    ],
    [4, [[3, [true]]]],
    [5, [[4, [true]]]],
  ]);

  t.deepEqual([...network.sort()], [1, 5, 2, 4, 3]);
});

test("#sort() yields nothing for a cyclic network", (t) => {
  // 1
  // |- 2
  //    |- 3
  //    |- 4
  //       |- 1
  const network = Network.from<number, boolean>([
    [1, [[2, [true]]]],
    [
      2,
      [
        [3, [true]],
        [4, [true]],
      ],
    ],
    [4, [[1, [true]]]],
  ]);

  t.deepEqual([...network.sort()], []);
});
