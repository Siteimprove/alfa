import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { audit } from "@alfa/act";

import { Title } from "../src/title/rule";
import { outcome } from "./helpers/outcome";

test("Passes when at least one non-empty title exists within a document", async t => {
  const document = (
    <html>
      <head>
        <title>Hello world</title>
      </head>
    </html>
  );

  const results = await audit(Title, { document });

  outcome(t, results, { passed: [document] });
});
