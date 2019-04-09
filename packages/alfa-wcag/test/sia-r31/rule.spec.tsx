import { Outcome, QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R31 } from "../../src/sia-r31/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when video has a media alternative for text on the page", t => {
  const video = <video src="foo.mp4" controls />;

  const textAlternative = <p>Foo bar?</p>;

  const document = documentFromNodes([
    <div>
      {video}
      {textAlternative}
    </div>
  ]);

  outcome(
    t,
    SIA_R31,
    { document, device: getDefaultDevice() },
    { passed: [video] },
    [
      {
        rule: SIA_R31,
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R31,
        type: QuestionType.Boolean,
        id: "has-audio",
        aspect: document,
        target: video,
        answer: true
      },
      {
        rule: SIA_R31,
        type: QuestionType.Node,
        id: "text-alternative",
        aspect: document,
        target: video,
        answer: textAlternative
      },
      {
        rule: SIA_R31,
        type: QuestionType.Node,
        id: "label",
        aspect: document,
        target: video,
        answer: textAlternative
      }
    ]
  );
});

test("Fails when video has no media alternative for text on the page", t => {
  const video = <video src="foo.mp4" controls />;

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R31,
    { document, device: getDefaultDevice() },
    { failed: [video] },
    [
      {
        rule: SIA_R31,
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R31,
        type: QuestionType.Boolean,
        id: "has-audio",
        aspect: document,
        target: video,
        answer: true
      },
      {
        rule: SIA_R31,
        type: QuestionType.Node,
        id: "text-alternative",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R31,
        type: QuestionType.Node,
        id: "label",
        aspect: document,
        target: video,
        answer: false
      }
    ]
  );
});

test("Is inapplicable when element is not a video element", t => {
  const img = <img src="foo.mp4" />;

  const document = documentFromNodes([img]);

  outcome(
    t,
    SIA_R31,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});

test("Cannot tell when no answers are passed", t => {
  const video = <video src="foo.mp4" controls />;

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R31,
    { document, device: getDefaultDevice() },
    { cantTell: [video] }
  );
});
