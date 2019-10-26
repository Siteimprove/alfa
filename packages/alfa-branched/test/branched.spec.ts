import { test } from "@siteimprove/alfa-test";

import { Branched } from "../src/branched";

const n = Branched.of(1, "foo").branch(2, "bar");

test("map() applies a function to a branched value", t => {
  const m = n.map(value => value * 2);

  t.deepEqual(m.toJSON(), {
    values: [
      {
        value: 2,
        branches: ["foo"]
      },
      {
        value: 4,
        branches: ["bar"]
      }
    ]
  });
});

test("flatMap() applies a function to a branched value and flattens the result", t => {
  const m = n.flatMap(value => {
    return Branched.of(value * 2, "foo").branch(value ** 4, "bar");
  });

  t.deepEqual(m.toJSON(), {
    values: [
      {
        value: 2,
        branches: ["foo"]
      },
      {
        value: 16,
        branches: ["bar"]
      }
    ]
  });
});

test("branch() creates an additional value with branches", t => {
  t.deepEqual(n.toJSON(), {
    values: [
      {
        value: 1,
        branches: ["foo"]
      },
      {
        value: 2,
        branches: ["bar"]
      }
    ]
  });
});

test("branch() merges branches with the same value", t => {
  const n = Branched.of(1, "foo").branch(1, "bar");

  t.deepEqual(n.toJSON(), {
    values: [
      {
        value: 1,
        branches: ["foo", "bar"]
      }
    ]
  });
});

test("branch() merges branchless values that are the same", t => {
  const n = Branched.of(1).branch(1);

  t.deepEqual(n.toJSON(), {
    values: [
      {
        value: 1,
        branches: null
      }
    ]
  });
});

test("branch() merges branchless values that are not the same", t => {
  const n = Branched.of(1).branch(2);

  t.deepEqual(n.toJSON(), {
    values: [
      {
        value: 2,
        branches: null
      }
    ]
  });
});

test("branch() does not merge branchless and branched values", t => {
  const n = Branched.of<number, string>(1)
    .branch(1, "foo")
    .branch(1, "bar");

  t.deepEqual(n.toJSON(), {
    values: [
      {
        value: 1,
        branches: null
      },
      {
        value: 1,
        branches: ["foo", "bar"]
      }
    ]
  });
});

test("branch() removes duplicated branches", t => {
  const n = Branched.of(1, "foo", "bar").branch(2, "bar");

  t.deepEqual(n.toJSON(), {
    values: [
      {
        value: 1,
        branches: ["foo"]
      },
      {
        value: 2,
        branches: ["bar"]
      }
    ]
  });
});

test("flatten() flattens a branched value of branched values", t => {
  const m = n
    .map(value => {
      return Branched.of(value * 2, "foo").branch(value ** 4, "bar");
    })
    .flatten();

  t.deepEqual(m.toJSON(), {
    values: [
      {
        value: 2,
        branches: ["foo"]
      },
      {
        value: 16,
        branches: ["bar"]
      }
    ]
  });
});

test("flatten() does nothing to a branched value of non-branched values", t => {
  const m = n.map(value => value * 2);

  t.deepEqual(m.toJSON(), m.flatten().toJSON());
});

test("flatten() flattens a branched value of both branchless and branched values", t => {
  const n = Branched.of<number, string>(1).branch(8, "foo");

  const m = n
    .map(n => Branched.of<number, string>(n + 2).branch(n + 4, "foo"))
    .flatten();

  t.deepEqual(m.toJSON(), {
    values: [
      {
        value: 3,
        branches: null
      },
      {
        value: 12,
        branches: ["foo"]
      }
    ]
  });
});

test("flatten() keeps branched values when merged with branchless values", t => {
  const n = Branched.of<number, string>(1).branch(8, "foo", "bar");

  const m = n
    .map(n => Branched.of<number, string>(n + 2).branch(n + 4, "foo"))
    .flatten();

  t.deepEqual(m.toJSON(), {
    values: [
      {
        value: 3,
        branches: null
      },
      {
        value: 10,
        branches: ["bar"]
      },
      {
        value: 12,
        branches: ["foo"]
      }
    ]
  });
});

test("flatten() assigns unused branches to branchless values", t => {
  const n = Branched.of<number, string>(1).branch(8, "foo");

  const m = n
    .map(n => Branched.of<number, string>(n + 2, "bar").branch(n + 4, "foo"))
    .flatten();

  t.deepEqual(m.toJSON(), {
    values: [
      {
        value: 3,
        branches: ["bar"]
      },
      {
        value: 12,
        branches: ["foo"]
      }
    ]
  });
});

test("traverse() traverses a list of values and lifts them to a branched value of lists", t => {
  const ns = [1, 2, 3];

  t.deepEqual(
    Branched.traverse(ns, n => Branched.of(n, "foo").branch(n * 2, "bar"))
      .map(values => [...values])
      .toJSON(),
    {
      values: [
        {
          value: [1, 2, 3],
          branches: ["foo"]
        },
        {
          value: [2, 4, 6],
          branches: ["bar"]
        }
      ]
    }
  );
});

test("sequence() inverts a list of branched values to a branched value of lists", t => {
  const ns = [
    Branched.of(1, "foo").branch(2, "bar"),
    Branched.of(3, "foo").branch(4, "bar"),
    Branched.of(5, "foo", "bar")
  ];

  t.deepEqual(
    Branched.sequence(ns)
      .map(values => [...values])
      .toJSON(),
    {
      values: [
        {
          value: [1, 3, 5],
          branches: ["foo"]
        },
        {
          value: [2, 4, 5],
          branches: ["bar"]
        }
      ]
    }
  );
});
