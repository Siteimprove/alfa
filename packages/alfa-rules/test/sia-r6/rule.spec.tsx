import { Outcome } from "@siteimprove/alfa-act";
import { Element, NodeType } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { SIA_R6 } from "../../src/sia-r6/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when document has matching language attributes", t => {
  const html: Element = {
    nodeType: NodeType.Element,
    attributes: [
      {
        nodeType: NodeType.Attribute,
        prefix: null,
        localName: "lang",
        value: "en",
        childNodes: []
      },
      {
        nodeType: NodeType.Attribute,
        prefix: "xml",
        localName: "lang",
        value: "en",
        childNodes: []
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

test("Fails when document does not have matching language attributes", t => {
  const html: Element = {
    nodeType: NodeType.Element,
    attributes: [
      {
        nodeType: NodeType.Attribute,
        prefix: null,
        localName: "lang",
        value: "en",
        childNodes: []
      },
      {
        nodeType: NodeType.Attribute,
        prefix: "xml",
        localName: "lang",
        value: "da",
        childNodes: []
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

test("Is inapplicable when document has only one language attribute", t => {
  const html: Element = {
    nodeType: NodeType.Element,
    attributes: [
      {
        nodeType: NodeType.Attribute,
        prefix: null,
        localName: "lang",
        value: "en",
        childNodes: []
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
