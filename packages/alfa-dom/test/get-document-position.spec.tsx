import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getDocumentPosition } from "../src/get-document-position";

const p1 = <p>foo</p>;
const p2 = <p>bar</p>;
const p3 = <p>baz</p>;
const p4 = <p>qux</p>;

const shadow = (
  <shadow>
    <slot />
    {p2}
  </shadow>
);

const iframe = (
  <iframe>
    <content>{p3}</content>
  </iframe>
);

const div = (
  <div id="host">
    {shadow}
    {p1}
    {iframe}
    {p4}
  </div>
);

test("Returns the document position of an element", t => {
  t.equal(getDocumentPosition(p1, div), 1);
});

test("Returns the composed document position of an element", t => {
  t.equal(getDocumentPosition(p2, div, { composed: true }), 3);
});

test("Returns the flattened document position of an element", t => {
  t.equal(getDocumentPosition(p1, div, { flattened: true }), 1);
});

test("Returns the nested document position of an element", t => {
  t.equal(getDocumentPosition(p4, div, { nested: true }), 7);
});

test("Returns null when an element is not in a context", t => {
  t.equal(getDocumentPosition(p2, div), null);
});
