import { Outcome, QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R15 } from "../../src/sia-r15/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when iframes with the same accessible name embed the same resource", t => {
  const foo = <iframe src="https://foo.bar/baz.html" aria-label="foo" />;
  const bar = <iframe src="https://foo.bar/baz.html" aria-label="foo" />;

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
    { passed: [[foo, bar]] }
  );
});

test("Passes when iframes with the same accessible name embed equivalent resources", t => {
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
    { passed: [[foo, bar]] },
    [
      {
        rule: SIA_R15,
        type: QuestionType.Boolean,
        id: "embed-equivalent-resources",
        aspect: document,
        target: [foo, bar],
        answer: true
      }
    ]
  );
});

test("Fails when iframes with the same accessible name do not embed equivalent resources", t => {
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
    { failed: [[foo, bar]] },
    [
      {
        rule: SIA_R15,
        type: QuestionType.Boolean,
        id: "embed-equivalent-resources",
        aspect: document,
        target: [foo, bar],
        answer: false
      }
    ]
  );
});

test("Is inapplicable when no iframes have the same accessible name", t => {
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
    Outcome.Inapplicable
  );
});
