import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { isElementByName } from "../../src/helpers/is-element-by-name";
import { documentFromNodes } from "../helpers/document-from-nodes";
import { Namespace } from "@siteimprove/alfa-dom";

test("Returns true if element is has matching name and namespace", t => {
  const div = <div>foo</div>;
  const span = <span>bar</span>;
  const doc = documentFromNodes([div, span])
  t(isElementByName(div, doc, ["div", "span"], [Namespace.HTML, Namespace.SVG]);
});

/*
test("Returns false if element is not a document element", t => {
  const tag = <html />;
  t(!isDocumentElement(tag, tag));
});

test("Returns false if element is not in the HTML namespace", t => {
  const tag = <svg />;
  const doc = <document>{tag}</document>;
  t(!isDocumentElement(tag, doc));
});
*/