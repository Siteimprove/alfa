import { audit } from "@siteimprove/alfa-act";
import { NodeType } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R1 } from "../../src/sia-r1/rule";
import { outcome } from "../helpers/outcome";

const request = {
  method: "GET",
  url: "https://foo.bar/baz.html",
  headers: {}
};

const response = {
  status: 200,
  headers: {},
  body: ""
};

test("SIA-R1 is only applicable to documents", t => {
  const document = {
    nodeType: NodeType.Document,
    compatMode: "CSS1Compat",
    styleSheets: [],
    childNodes: (
      <html>
        <head>
          <title>Hello world</title>
        </head>
      </html>
    )
  };

  const results = audit({ document, request, response }, SIA_R1);
  outcome(t, results, { passed: [document] });
});
