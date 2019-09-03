import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import {
  compareDocumentPosition,
  DocumentPosition
} from "../src/compare-document-position";

const em = <em />;
const strong = <strong />;
const span = <span>{em}</span>;

const context = (
  <div>
    {span}
    {strong}
  </div>
);

test("Returns 0 when a node is compared to itself", t => {
  t.equal(compareDocumentPosition(em, em, context), 0);
});

test("Returns < 0 when the first node comes before the second", t => {
  t(compareDocumentPosition(em, strong, context) < 0);
});

test("Returns > 0 when the first node comes after the second", t => {
  t(compareDocumentPosition(strong, em, context) > 0);
});

test("Returns Disconnected if the nodes are not in the same tree", t => {
  const div = <div />;
  const cmp = compareDocumentPosition(strong, div, context);
  const revcmp = compareDocumentPosition(div, strong, context);

  // Check if nodes are disconnected
  const isDisc = cmp & DocumentPosition.Disconnected;
  t.equal(isDisc, DocumentPosition.Disconnected);

  /*
   * The following checks are needed according to the spec
   * @see https://www.w3.org/TR/dom/#dom-node-comparedocumentposition
   */

  const isPrec = cmp & DocumentPosition.Preceding;
  const isFoll = cmp & DocumentPosition.Following;

  // check that only the preceding flag xor the following flag is set
  t.equal((isPrec >> 1) ^ (isFoll >> 2), 1);
  // chech that if strong precedes div then the div should follow strong
  if (isPrec === DocumentPosition.Preceding) {
    t(
      cmp ===
        (DocumentPosition.Disconnected |
          DocumentPosition.ImplementationSpecific |
          DocumentPosition.Preceding) &&
        revcmp ===
          (DocumentPosition.Disconnected |
            DocumentPosition.ImplementationSpecific |
            DocumentPosition.Following)
    );
  } else {
    t(
      cmp ===
        (DocumentPosition.Disconnected |
          DocumentPosition.ImplementationSpecific |
          DocumentPosition.Following) &&
        revcmp ===
          (DocumentPosition.Disconnected |
            DocumentPosition.ImplementationSpecific |
            DocumentPosition.Preceding)
    );
  }
});

test("Returns ContainedBy and Following as negative value when the other node is contained by the reference node", t => {
  t.equal(
    compareDocumentPosition(span, em, context),
    -1 * (DocumentPosition.ContainedBy | DocumentPosition.Following)
  );
});

test("Returns Contains and Preceding when the reference node is contained by the other node", t => {
  t.equal(
    compareDocumentPosition(em, span, context),
    DocumentPosition.Contains | DocumentPosition.Preceding
  );
});
