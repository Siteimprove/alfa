import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getParentElement } from "../src/get-parent-element";
import { Document, NodeType } from "../src/types";

const body = <body />;
const html = <html>{body}</html>;

const document: Document = {
  nodeType: NodeType.Document,
  childNodes: [<html />],
  styleSheets: []
};

test("getParentElement() gets the parent element of an element", t => {
  t.deepEqual(getParentElement(body, html), Some.of(html));
});

test("getParentElement() returns none when no parent element exists", t => {
  t.equal(getParentElement(html, html), None);
});

test("getParentElement() returns none when a parent exists but it's not an element", t => {
  t.equal(getParentElement(html, document), None);
});
