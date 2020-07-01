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
