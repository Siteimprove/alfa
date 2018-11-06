import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { isDocumentElement } from "../../src/helpers/is-document-element";

test("Returns true if element is a document element", t => {
  const tag = <html />;
  const doc = <document>{tag}</document>;
  t(isDocumentElement(tag, doc));
});

test("Returns false if element is not a document element", t => {
  const tag = <html />;
  t(!isDocumentElement(tag, tag));
});

test("Returns false if element is not in the HTML namespace", t => {
  const tag = <svg />;
  const doc = <document>{tag}</document>;
  t(!isDocumentElement(tag, doc));
});
