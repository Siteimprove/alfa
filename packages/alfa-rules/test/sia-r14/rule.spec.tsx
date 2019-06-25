import { Outcome, QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R14 } from "../../src/sia-r14/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when accessible name matches textual content", t => {
  const div = (
    <div role="link" aria-label="foo ">
      foo
    </div>
  );

  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R14,
    { document, device: getDefaultDevice() },
    { passed: [div] }
  );
});

test("Cannot tell when accessible does not match textual content and no answers are provided", t => {
  const div = (
    <div role="link" aria-label="foo">
      bar
    </div>
  );

  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R14,
    { document, device: getDefaultDevice() },
    { cantTell: [div] }
  );
});

test("Fails when accessible name does not match textual content and textual content is human lanuage", t => {
  const div = (
    <div role="link" aria-label="foo">
      bar
    </div>
  );

  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R14,
    { document, device: getDefaultDevice() },
    { failed: [div] },
    [
      {
        rule: SIA_R14,
        type: QuestionType.Boolean,
        id: "is-human-language",
        aspect: document,
        target: div,
        answer: true
      }
    ]
  );
});

test("Passes when accessible name does not match textual content and textual content is not human lanuage", t => {
  const div = (
    <div role="link" aria-label="foo">
      bar
    </div>
  );

  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R14,
    { document, device: getDefaultDevice() },
    { passed: [div] },
    [
      {
        rule: SIA_R14,
        type: QuestionType.Boolean,
        id: "is-human-language",
        aspect: document,
        target: div,
        answer: false
      }
    ]
  );
});

test("Is inapplicable when element is not a widget", t => {
  const a = <a aria-label="foo">bar</a>;
  const document = documentFromNodes([a]);

  outcome(
    t,
    SIA_R14,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
