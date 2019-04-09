import { Outcome, QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R22 } from "../../src/sia-r22/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when captions are available for audio information in non-streaming video elements", t => {
  const video = (
    <video
      src="../test-assets/perspective-video/perspective-video-with-captions.mp4"
      controls
    />
  );

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R22,
    { document, device: getDefaultDevice() },
    { passed: [video] },
    [
      {
        rule: SIA_R22,
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R22,
        type: QuestionType.Boolean,
        id: "has-audio",
        aspect: document,
        target: video,
        answer: true
      },
      {
        rule: SIA_R22,
        id: "has-captions",
        type: QuestionType.Boolean,
        aspect: document,
        target: video,
        answer: true
      }
    ]
  );
});

test("Fails when no captions are available for audio information in non-streaming video elements", t => {
  const video = (
    <video
      src="../test-assets/perspective-video/perspective-video-with-captions.mp4"
      controls
    />
  );

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R22,
    { document, device: getDefaultDevice() },
    { failed: [video] },
    [
      {
        rule: SIA_R22,
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R22,
        type: QuestionType.Boolean,
        id: "has-audio",
        aspect: document,
        target: video,
        answer: true
      },
      {
        rule: SIA_R22,
        id: "has-captions",
        type: QuestionType.Boolean,
        aspect: document,
        target: video,
        answer: false
      }
    ]
  );
});

test("Is inapplicable when element is not a video element", t => {
  const img = (
    <img src="../test-assets/perspective-video/perspective-video-with-captions.mp4" />
  );

  const document = documentFromNodes([img]);

  outcome(
    t,
    SIA_R22,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});

test("Cannot tell when no answers are passed", t => {
  const video = (
    <video
      src="../test-assets/perspective-video/perspective-video-with-captions.mp4"
      controls
    />
  );

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R22,
    { document, device: getDefaultDevice() },
    { cantTell: [video] }
  );
});
