import { Serializable } from "@siteimprove/alfa-json";
import { None, Option } from "@siteimprove/alfa-option";
import { Assertions, test } from "@siteimprove/alfa-test";

import { h } from "../src/h";

import { Namespace } from "../src/namespace";
import { Node } from "../src/node";

import { Document } from "../src/node/document";
import { Element } from "../src/node/element";
import { Type } from "../src/node/type";

/**
 * Turns a Node into JSON and recursively removes the NodeId that are
 * irrelevant for these tests.
 */
function removeId<N extends Node = Node>(node: N): Serializable.ToJSON<N> {
  function removeId(json: Node.JSON): Node.JSON {
    return {
      ...json,
      children:
        json.children !== undefined ? json.children.map(removeId) : undefined,
      nodeId: undefined,
    };
  }

  return removeId(node.toJSON()) as Serializable.ToJSON<N>;
}

test("h() constructs an element", (t) => {
  t.deepEqual(
    removeId(h("div")),
    removeId(Element.of(Option.of(Namespace.HTML), None, "div"))
  );
});

test("h.document() constructs a document", (t) => {
  t.deepEqual(
    removeId(h.document([h.type("html"), h("html")])),
    removeId(
      Document.of([
        Type.of("html"),
        Element.of(Option.of(Namespace.HTML), None, "html"),
      ])
    )
  );
});

test("h() puts the first document child in a content document", (t) => {
  const document1 = h.document([h.type("html"), h("html")]);
  const document2 = h.document([h.type("html"), h("html")]);

  const iframe = h.element(
    "iframe",
    [],
    [h.element("dummy"), document1, h.element("dummy"), document2]
  );

  t.deepEqual(removeId(iframe.content.get()), removeId(document1));
});

test("h() puts the first shadow child in a shadow tree", (t) => {
  const shadow1 = h.shadow([h.element("shadow")]);
  const shadow2 = h.shadow([h.element("exclude")]);

  const iframe = h.element(
    "iframe",
    [],
    [h.element("dummy"), shadow1, h.element("dummy"), shadow2]
  );

  t.deepEqual(removeId(iframe.shadow.get()), removeId(shadow1));
});

test("h() put elements in the correct namespace", (t) => {
  t.deepEqual(
    removeId(h("circle")),
    removeId(Element.of(Option.of(Namespace.SVG), None, "circle"))
  );

  t.deepEqual(
    removeId(h("mfrac")),
    removeId(Element.of(Option.of(Namespace.MathML), None, "mfrac"))
  );
});
