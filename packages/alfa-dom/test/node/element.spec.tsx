import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";
import { Node as treeNode } from "@siteimprove/alfa-tree";

import { Node } from "../../src/node";

import { Element } from "../../src/node/element";
import { Namespace } from "../../src/namespace";

test("#tabIndex() returns the tab index explicitly assigned to an element", (t) => {
  t.equal((<div tabindex="42" />).tabIndex().get(), 42);
});

test("#tabIndex() ignores characters after the first non-digit", (t) => {
  t.equal((<div tabindex="-1-toRemove" />).tabIndex().get(), -1);
});

test("#tabIndex() returns 0 for an <a> element with an href attribute", (t) => {
  t.equal((<a href="#" />).tabIndex().get(), 0);
});

test("#tabIndex() returns None for an <a> element without an href attribute", (t) => {
  t.equal((<a />).tabIndex().isNone(), true);
});

test("#tabIndex() returns None for a <div> element with tabindex null", (t) => {
  t.equal((<div tabindex="null" />).tabIndex().isNone(), true);
});

test("#tabIndex() returns 0 for a <button> element", (t) => {
  t.equal((<button />).tabIndex().get(), 0);
});

test(`#tabIndex() returns 0 for a <summary> element that is the first <summary>
      child element of a <details> element`, (t) => {
  const summary = <summary />;

  <details>{summary}</details>;

  t.equal(summary.tabIndex().get(), 0);
});

test(`#tabIndex() returns None for a <summary> element that is not the child of
      a <details> elements`, (t) => {
  t.equal((<summary />).tabIndex().isNone(), true);
});

test(`#tabIndex() returns None for a <summary> element that is not the first
      <summary> child element of a <details> elements`, (t) => {
  const summary = <summary />;

  <details>
    <summary />
    {summary}
  </details>;

  t.equal(summary.tabIndex().isNone(), true);
});

test("Element.of() accepts a user nodeId", (t) => {
  const element = Element.of(
    Option.of(Namespace.HTML),
    None,
    "div",
    [],
    [],
    None,
    treeNode.Id.user("type", "namespace", 42)
  );

  t.deepEqual(element.nodeId.kind, treeNode.Id.Kind.User);

  t.deepEqual(element.nodeId.toJSON(), {
    type: "type",
    namespace: "namespace",
    id: 42,
  });
});

test("Element.of() generates a system nodeId if none is provided", (t) => {
  const element = Element.of(Option.of(Namespace.HTML), None, "div");

  t.deepEqual(element.nodeId.kind, treeNode.Id.Kind.System);
  t.deepEqual(element.nodeId.type, "alfa-dom");
  t.deepEqual(element.nodeId.namespace, "");
});

test("Element.of() generates a system nodeId with namespace", (t) => {
  const element = Element.of(
    Option.of(Namespace.HTML),
    None,
    "div",
    [],
    [],
    None,
    "foo"
  );

  t.deepEqual(element.nodeId.kind, treeNode.Id.Kind.System);
  t.deepEqual(element.nodeId.type, "alfa-dom");
  t.deepEqual(element.nodeId.namespace, "foo");
});
