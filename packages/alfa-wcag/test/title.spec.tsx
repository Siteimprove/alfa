import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { audit } from "@siteimprove/alfa-act";

import { Title } from "../src/title/rule";
import { outcome } from "./helpers/outcome";

test("Passes when at least one non-empty title exists within a document", t => {
  const document = (
    <html>
      <head>
        <title>Hello world</title>
      </head>
    </html>
  );

  const results = audit(Title, { document });

  outcome(t, results, { passed: [document] });
});
