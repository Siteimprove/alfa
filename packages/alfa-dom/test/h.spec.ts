import { test } from "@siteimprove/alfa-test";

import { Option, None } from "@siteimprove/alfa-option";

import { h } from "../src/h";

import { Namespace } from "../src/namespace";

import { Document } from "../src/node/document";
import { Element } from "../src/node/element";
import { Type } from "../src/node/type";

test("h() constructs an element", (t) => {
  t.deepEqual(h("div"), Element.of(Option.of(Namespace.HTML), None, "div"));
});

test("h.document() constructs a document", (t) => {
  t.deepEqual(
    h.document([h.type("html"), h("html")]),
    Document.of([
      Type.of("html"),
      Element.of(Option.of(Namespace.HTML), None, "html"),
    ])
  );
});

test("h() puts the first document child in a content document", (t) => {
  const document1 = h.document([h.type("html"), h("html")]);
  const document2 = h.document([h.type("html"), h("html")]);

  const iframe = h.element("iframe", [], [
    h.element("dummy"),
    document1,
    h.element("dummy"),
    document2
  ]);

  t.deepEqual(iframe.content.get(), document1);
});

test("h() puts the first shadow child in a shadow tree", (t) => {
  const shadow1 = h.shadow([h.element("shadow")]);
  const shadow2 = h.shadow([h.element("exclude")]);

  const iframe = h.element("iframe", [], [
    h.element("dummy"),
    shadow1,
    h.element("dummy"),
    shadow2
  ]);

  t.deepEqual(iframe.shadow.get(), shadow1);
});
