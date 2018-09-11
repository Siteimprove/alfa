import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getDocumentPosition } from "../src/get-document-position";

test("getDocumentPosition returns 3 when element has position 3 with naive traversal", t => {
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

test("getDocumentPosition returns null when element is not in context", t => {
  const strong = <strong />;
  const span = <span />;
  const div = <div>{span}</div>;
  t.equal(getDocumentPosition(strong, div), null);
});
