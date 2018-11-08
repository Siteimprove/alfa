import { audit } from "@siteimprove/alfa-act";
import { Document, NodeType } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R1 } from "../../src/sia-r1/rule";
import { outcome } from "../helpers/outcome";

test("SIA-R1 passes when document has a title", t => {
  const document: Document = {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    styleSheets: [],
    childNodes: [
      <html>
        <head>
          <title>Hello world</title>
        </head>
      </html>
    ]
  };

  outcome(t, audit({ document }, [SIA_R1]), { passed: [document] });
});

test("SIA-R1 fails when document has no title", t => {
  const document: Document = {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    styleSheets: [],
    childNodes: [
      <html>
        <head />
      </html>
    ]
  };

  outcome(t, audit({ document }, [SIA_R1]), { failed: [document] });
});

test("SIA-R1 fails when only other namespace has a title", t => {
  const document: Document = {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    styleSheets: [],
    childNodes: [
      <html>
        <head>
          <svg>
            <title />
          </svg>
        </head>
      </html>
    ]
  };

  outcome(t, audit({ document }, [SIA_R1]), { failed: [document] });
});

test("SIA-R1 only works in the HTML namespace", t => {
  const document: Document = {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    styleSheets: [],
    childNodes: [
      <svg>
        <title>Hello World</title>
      </svg>
    ]
  };

  outcome(t, audit({ document }, [SIA_R1]), { inapplicable: [document] });
});
