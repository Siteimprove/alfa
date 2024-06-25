import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import { h } from "../dist";

import { Namespace } from "../dist/namespace";

import { Document } from "../dist/node/document";
import { Element } from "../dist/node/element";
import { Type } from "../dist/node/type";

test("h() constructs an element", (t) => {
  t.deepEqual(
    h("div").toJSON(),
    Element.of(Option.of(Namespace.HTML), None, "div").toJSON(),
  );
});

test("h.document() constructs a document", (t) => {
  t.deepEqual(
    h.document([h.type("html"), h("html")]).toJSON(),
    Document.of([
      Type.of("html"),
      Element.of(Option.of(Namespace.HTML), None, "html"),
    ]).toJSON(),
  );
});

test("h() puts the first document child in a content document", (t) => {
  const document1 = h.document([h.type("html"), h("html")]);
  const document2 = h.document([h.type("html"), h("html")]);

  const iframe = h.element(
    "iframe",
    [],
    [h.element("dummy"), document1, h.element("dummy"), document2],
  );

  t.deepEqual(iframe.content.getUnsafe(), document1);
});

test("h() puts the first shadow child in a shadow tree", (t) => {
  const shadow1 = h.shadow([h.element("shadow")]);
  const shadow2 = h.shadow([h.element("exclude")]);

  const iframe = h.element(
    "iframe",
    [],
    [h.element("dummy"), shadow1, h.element("dummy"), shadow2],
  );

  t.deepEqual(iframe.shadow.getUnsafe(), shadow1);
});

test("h() put elements in the correct namespace", (t) => {
  t.deepEqual(
    h("circle").toJSON(),
    Element.of(Option.of(Namespace.SVG), None, "circle").toJSON(),
  );

  t.deepEqual(
    h("mfrac").toJSON(),
    Element.of(Option.of(Namespace.MathML), None, "mfrac").toJSON(),
  );
});

test("h() accepts a serializationId which is set on the Element", (t) => {
  const serializationId = crypto.randomUUID();
  const elm = h(
    "div",
    undefined,
    undefined,
    undefined,
    undefined,
    Device.standard(),
    undefined,
    serializationId,
  );

  t.equal(elm.serializationId, serializationId);
});

test("h() creates serializationId when it is not provided", (t) => {
  const elm = h("div");

  t.equal(
    elm.serializationId.length,
    36,
    "serializationId should be a UUID of length 36",
  );
});
