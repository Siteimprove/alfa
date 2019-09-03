import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getParentElement } from "../src/get-parent-element";
import { Document } from "../src/types";

test("Returns parent element", t => {
  const body = <body />;
  const html = <html>{body}</html>;
  t.equal(getParentElement(body, html), html);
});

test("Returns null when parent does not exist", t => {
  const div = <div />;
  t.equal(getParentElement(div, div), null);
});

test("Returns null when parent is not an element", t => {
  const document: Document = {
    nodeType: 9,
    childNodes: [<html />],
    styleSheets: []
  };
  t.equal(getParentElement(document.childNodes[0], document), null);
});
