import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { audit } from "@siteimprove/alfa-act";
import { find, findAll } from "@siteimprove/alfa-dom";

import { UniqueId } from "../src/unique-id/rule";
import { outcome } from "./helpers/outcome";

test("Passes when no duplicate IDs exist within a document", async t => {
  const document = (
    <div id="foo">
      <div id="bar" />
    </div>
  );

  const results = await audit(UniqueId, { document });

  const foo = find(document, document, "#foo");
  const bar = find(document, document, "#bar");

  outcome(t, results, { passed: [foo, bar] });
});

test("Fails when elements with duplicate IDs exist within a document", async t => {
  const document = (
    <div id="foo">
      <div id="foo" />
    </div>
  );

  const results = await audit(UniqueId, { document });

  const foos = findAll(document, document, "#foo");

  outcome(t, results, { failed: [...foos] });
});

test("Marks the document as inapplicable when no elements with IDs exist", async t => {
  const document = (
    <div>
      foo
      <div>bar</div>
    </div>
  );

  const results = await audit(UniqueId, { document });

  outcome(t, results, { inapplicable: [document] });
});
