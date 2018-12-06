import { Outcome } from "@siteimprove/alfa-act";
import { Element, NodeType } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { SIA_R6 } from "../../src/sia-r6/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R6 passes when document has matching language attributes", t => {
  const html: Element = {
    nodeType: NodeType.Element,
    attributes: [
      {
        localName: "lang",
        prefix: null,
        value: "en"
      },
      {
        localName: "lang",
        prefix: "xml",
        value: "en"
      }
    ],
    prefix: null,
    localName: "html",
    shadowRoot: null,
    childNodes: []
  };
  const document = documentFromNodes([html]);

  outcome(t, SIA_R6, { document }, { passed: [html] });
});

test("SIA-R6 fails when document does not have matching language attributes", t => {
  const html: Element = {
    nodeType: NodeType.Element,
    attributes: [
      {
        localName: "lang",
        prefix: null,
        value: "en"
      },
      {
        localName: "lang",
        prefix: "xml",
        value: "da"
      }
    ],
    prefix: null,
    localName: "html",
    shadowRoot: null,
    childNodes: []
  };
  const document = documentFromNodes([html]);

  outcome(t, SIA_R6, { document }, { failed: [html] });
});

test("SIA-R6 is inapplicable when document has only one language attribute", t => {
  const html: Element = {
    nodeType: NodeType.Element,
    attributes: [
      {
        localName: "lang",
        prefix: null,
        value: "en"
      }
    ],
    prefix: null,
    localName: "html",
    shadowRoot: null,
    childNodes: []
  };
  const document = documentFromNodes([html]);

  outcome(t, SIA_R6, { document }, Outcome.Inapplicable);
});
