import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R15 } from "../../src/sia-r15/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when an iframe has a unique accessible name", t => {
  const foo = <iframe src="https://foo.bar/baz.html" aria-label="foo" />;
  const bar = <iframe src="https://foo.bar/" aria-label="bar" />;
  const html = (
    <html>
      {foo}
      {bar}
    </html>
  );

  const document = documentFromNodes([html]);

  outcome(
    t,
    SIA_R15,
    { document, device: getDefaultDevice() },
    { passed: [foo, bar] }
  );
});

test("Fails when an iframe has no unique accessible name", t => {
  const foo = <iframe src="https://foo.bar/baz.html" aria-label="foo" />;
  const bar = <iframe src="https://foo.bar/" aria-label="foo" />;
  const html = (
    <html>
      {foo}
      {bar}
    </html>
  );

  const document = documentFromNodes([html]);

  outcome(
    t,
    SIA_R15,
    { document, device: getDefaultDevice() },
    { failed: [foo, bar] }
  );
});

test("Is inapplicable when element is not in the accessibility tree", t => {
  const foo = <iframe src="https://foo.bar/baz.html" />;
  const bar = <iframe src="https://foo.bar/" />;
  const html = (
    <html>
      {foo}
      {bar}
    </html>
  );

  const document = documentFromNodes([html]);

  outcome(
    t,
    SIA_R15,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
