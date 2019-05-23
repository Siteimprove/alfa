import { Outcome, QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R26 } from "../../src/sia-r26/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when non-streaming silent video has a media alternative for text on the page", t => {
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
    SIA_R26,
    { document, device: getDefaultDevice() },
    { passed: [video] },
    [
      {
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: video,
        answer: false
      },
      {
        type: QuestionType.Boolean,
        id: "has-audio",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R26,
        type: QuestionType.Node,
        id: "text-alternative",
        aspect: document,
        target: video,
        answer: textAlternative
      },
      {
        rule: SIA_R26,
        type: QuestionType.Node,
        id: "label",
        aspect: document,
        target: video,
        answer: textAlternative
      }
    ]
  );
});

test("Fails when non-streaming silent video has no media alternative for text on the page", t => {
  const video = (
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <source src="foo.webm" type="video/webm" />
    </video>
  );

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R26,
    { document, device: getDefaultDevice() },
    { failed: [video] },
    [
      {
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: video,
        answer: false
      },
      {
        type: QuestionType.Boolean,
        id: "has-audio",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R26,
        type: QuestionType.Node,
        id: "text-alternative",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R26,
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
    SIA_R26,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable,
    [
      {
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: img,
        answer: false
      },
      {
        type: QuestionType.Boolean,
        id: "has-audio",
        aspect: document,
        target: img,
        answer: false
      },
      {
        rule: SIA_R26,
        type: QuestionType.Node,
        id: "text-alternative",
        aspect: document,
        target: img,
        answer: null
      },
      {
        rule: SIA_R26,
        type: QuestionType.Node,
        id: "label",
        aspect: document,
        target: img,
        answer: null
      }
    ]
  );
});

test("Cannot tell when no answers are passed", t => {
  const video = (
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <source src="foo.webm" type="video/webm" />
    </video>
  );

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R26,
    { document, device: getDefaultDevice() },
    { cantTell: [video] }
  );
});
