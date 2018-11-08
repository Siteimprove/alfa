import { audit, Outcome } from "@siteimprove/alfa-act";
import { Element, NodeType } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { SIA_R6 } from "../../src/sia-r6/rule";

import { aspectsFromNodes } from "../helpers/aspects-from-nodes";
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
  const aspects = aspectsFromNodes([html]);

  outcome(t, audit(aspects, [SIA_R6]), { passed: [html] });
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
  const aspects = aspectsFromNodes([html]);

  outcome(t, audit(aspects, [SIA_R6]), { failed: [html] });
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
  const aspects = aspectsFromNodes([html]);

  outcome(t, audit(aspects, [SIA_R6]), Outcome.Inapplicable);
});
