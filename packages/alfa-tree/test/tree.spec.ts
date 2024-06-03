import { test } from "@siteimprove/alfa-test";

import * as json from "@siteimprove/alfa-json";

import { Node } from "../src";

class TestNode extends Node<0> {
  constructor(
    children: Array<TestNode>,
    externalId?: string,
    serializationId?: string,
  ) {
    super(children, "test-node", externalId, undefined, serializationId);
  }
}

function node(
  children: Array<TestNode>,
  externalId?: string,
  serializationId?: string,
) {
  return new TestNode(children, externalId, serializationId);
}

test("toJSON() does not include serialization id when option is not set", async (t) => {
  const root = node([node([node([], "qux")], "bar"), node([], "baz")], "foo");

  const result = root.toJSON();

  t.deepEqual(result, {
    type: "test-node",
    externalId: "foo",
    children: [
      {
        type: "test-node",
        externalId: "bar",
        children: [{ type: "test-node", externalId: "qux", children: [] }],
      },
      { type: "test-node", externalId: "baz", children: [] },
    ],
  });
});

test("toJSON() includes only serialization id and external id when verbosity is minimal", async (t) => {
  const serializationId = crypto.randomUUID();
  const root = node([], "foo", serializationId);

  const result = root.toJSON({
    verbosity: json.Serializable.Verbosity.Minimal,
  });

  t.deepEqual(result, {
    type: "test-node",
    externalId: "foo",
    serializationId: serializationId,
  });
});

test("toJSON() includes serialization id, external id and children when verbosity is high", async (t) => {
  const id1 = crypto.randomUUID();
  const id2 = crypto.randomUUID();
  const id3 = crypto.randomUUID();
  const id4 = crypto.randomUUID();

  const root = node(
    [node([node([], "baz", id3)], "bar", id2), node([], "qux", id4)],
    "foo",
    id1,
  );

  //     foo
  //     id1
  //    /   \
  //   /     \
  // bar     qux
  // id2     id4
  //  |
  //  |
  // baz
  // id3

  const result = root.toJSON({ verbosity: json.Serializable.Verbosity.High });

  t.deepEqual(result, {
    type: "test-node",
    externalId: "foo",
    serializationId: id1,
    children: [
      {
        type: "test-node",
        externalId: "bar",
        serializationId: id2,
        children: [
          {
            type: "test-node",
            externalId: "baz",
            serializationId: id3,
            children: [],
          },
        ],
      },
      {
        type: "test-node",
        externalId: "qux",
        serializationId: id4,
        children: [],
      },
    ],
  });
});
