import { audit } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { UniqueId } from "../../src/unique-id/rule";
import { outcome } from "../helpers/outcome";

test("Passes when no duplicate IDs exist within a document", t => {
  const bar = <div id="bar" />;
  const foo = <div id="foo">{bar}</div>;
  const document = (
    <html>
      <body>{foo}</body>
    </html>
  );

  const results = audit({ document }, UniqueId);

  outcome(t, results, { passed: [foo, bar] });
});

test("Fails when elements with duplicate IDs exist within a document", t => {
  const bar = <div id="foo" />;
  const foo = <div id="foo">{bar}</div>;
  const document = (
    <html>
      <body>{foo}</body>
    </html>
  );

  const results = audit({ document }, UniqueId);

  outcome(t, results, { failed: [foo, bar] });
});

test("Marks the document as inapplicable when no elements with IDs exist", t => {
  const document = (
    <div>
      <span />
    </div>
  );

  const results = audit({ document }, UniqueId);

  outcome(t, results, { inapplicable: [document] });
});
