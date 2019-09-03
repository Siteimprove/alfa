import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { getDocumentPosition } from "../src/get-document-position";

test("Returns 3 when element has position 3 with naive traversal", t => {
  const strong = <strong />;
  const span = <span>{strong}</span>;
  const div = (
    <div>
      <p />
      {span}
    </div>
  );
  t.equal(getDocumentPosition(strong, div), 3);
});

test("Returns null when element is not in context", t => {
  const strong = <strong />;
  const span = <span />;
  const div = <div>{span}</div>;
  t.equal(getDocumentPosition(strong, div), null);
});

test("Returns 3 when element has position 3 with composed traversal", t => {
  const p1 = <p>foo</p>;
  const p2 = <p>bar</p>;
  const slot = <slot />;
  const shadow = (
    <shadow>
      {slot}
      {p2}
    </shadow>
  );
  const div = (
    <div id="host">
      {shadow}
      {p1}
    </div>
  );

  t.equal(getDocumentPosition(p2, div, { composed: true }), 3);
});

test("Returns 1 when element has position 1 with flattened traversal", t => {
  const p1 = <p>foo</p>;
  const p2 = <p>bar</p>;
  const slot = <slot />;
  const shadow = (
    <shadow>
      {slot}
      {p2}
    </shadow>
  );
  const div = (
    <div id="host">
      {shadow}
      {p1}
    </div>
  );

  t.equal(getDocumentPosition(p1, div, { flattened: true }), 1);
});
