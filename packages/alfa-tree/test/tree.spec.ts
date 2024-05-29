import { test } from "@siteimprove/alfa-test";

import { Node } from "../src";

class TestNode extends Node<0> {
  constructor(children: Array<TestNode>, externalId?: string) {
    super(children, "test", externalId);
  }
}

test("toJSON() does not include serialization id when option is not set", async (t) => {
  const root = new TestNode([]);

  const result = root.toJSON();

  t.equal(result.serializationId, undefined);
});

test("toJSON() includes serialization id when option is false", async (t) => {
  const root = new TestNode([]);

  const result = root.toJSON({ includeId: false });

  t.equal(result.serializationId, undefined);
});

test("toJSON() includes serialization id when option is true", async (t) => {
  const root = new TestNode([]);

  const result = root.toJSON({ includeId: true });

  t.equal(
    result.serializationId?.length,
    36,
    "serializationId should be a UUID of length 36",
  );
});

test("toJSON() serializes full tree when verbosity is not set", async (t) => {
  const root = new TestNode([
    new TestNode([new TestNode([])]),
    new TestNode([]),
  ]);

  const result = root.toJSON();

  t.deepEqual(result, {
    type: "test",
    children: [
      { type: "test", children: [{ type: "test", children: [] }] },
      { type: "test", children: [] },
    ],
  });
});

test("toJSON() serializes full tree when verbosity is set to Full", async (t) => {
  const root = new TestNode([
    new TestNode([new TestNode([])]),
    new TestNode([]),
  ]);

  const result = root.toJSON({ verbosity: Node.SerializationVerbosity.Full });

  t.deepEqual(result, {
    type: "test",
    children: [
      { type: "test", children: [{ type: "test", children: [] }] },
      { type: "test", children: [] },
    ],
  });
});

test("toJSON() serializes ids only when verbosity is set to IdOnly", async (t) => {
  const root = new TestNode(
    [new TestNode([new TestNode([])]), new TestNode([])],
    "foo",
  );

  const result = root.toJSON({ verbosity: Node.SerializationVerbosity.IdOnly });

  t.equal(result.children, undefined);
  t.equal(result.externalId, "foo");
  t.equal(
    result.serializationId?.length,
    36,
    "serializationId should be a UUID of length 36",
  );
});

test("toJSON() serializes ids only when verbosity is set to IdOnly and ignores includeId option", async (t) => {
  const root = new TestNode(
    [new TestNode([new TestNode([])]), new TestNode([])],
    "foo",
  );

  const result = root.toJSON({
    verbosity: Node.SerializationVerbosity.IdOnly,
    includeId: false,
  });

  t.equal(result.children, undefined);
  t.equal(result.externalId, "foo");
  t.equal(
    result.serializationId?.length,
    36,
    "serializationId should be a UUID of length 36",
  );
});
