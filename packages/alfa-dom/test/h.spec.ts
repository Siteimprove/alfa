import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import { h } from "../dist/index.js";

import { Namespace } from "../dist/namespace.js";

import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Document } from "../dist/node/document.js";
import { Element } from "../dist/node/element.js";
import { Type } from "../dist/node/type.js";

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

test("h() accepts a internalId which is set on the Element", (t) => {
  const internalId = "some string";
  const elm = h(
    "div",
    undefined,
    undefined,
    undefined,
    undefined,
    Device.standard(),
    undefined,
    internalId,
  );

  t.equal(elm.internalId, internalId);
});

test("h() creates internalId when it is not provided", (t) => {
  const elm = h("div");

  t.equal(
    elm.internalId.length,
    32,
    "internalId should be an hex string of length 32",
  );
});

test("h.text() accepts box", (t) => {
  const device = Device.standard();
  const rect = Rectangle.of(8, 8, 20, 10);
  t.deepEqual(h.text("foo", rect, device).toJSON({ device }), {
    type: "text",
    data: "foo",
    box: rect.toJSON(),
  });
});
