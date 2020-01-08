import { QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R24 } from "../../src/sia-r24/rule";
import { SIA_R25 } from "../../src/sia-r25/rule";
import { SIA_R31 } from "../../src/sia-r31/rule";
import { SIA_R36 } from "../../src/sia-r36/rule";
import { SIA_R38 } from "../../src/sia-r38/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when composite rules are passing", t => {
  const video = (
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <source src="foo.webm" type="video/webm" />
      <track kind="descriptions" src="foo.vtt" />
    </video>
  );

  const document = documentFromNodes([<div>{video}</div>]);

  outcome(
    t,
    SIA_R38,
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
        answer: true
      },
      {
        rule: SIA_R24,
        type: QuestionType.Boolean,
        id: "has-transcript",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R25,
        type: QuestionType.Boolean,
        id: "has-description",
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
      },
      {
        rule: SIA_R36,
        type: QuestionType.Boolean,
        id: "track-describes-video",
        aspect: document,
        target: video,
        answer: true
      }
    ]
  );
});

test("Can't tell when there are no answers", t => {
  const video = (
    <video controls>
      <source src="foo.mp4" type="video/mp4" />
      <source src="foo.webm" type="video/webm" />
      <track kind="descriptions" src="foo.vtt" />
    </video>
  );

  const document = documentFromNodes([<div>{video}</div>]);

  outcome(
    t,
    SIA_R38,
    { document, device: getDefaultDevice() },
    { cantTell: [video] },
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
        answer: true
      }
    ]
  );
});
