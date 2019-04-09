import { Outcome, QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R25 } from "../../src/sia-r25/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when non-streaming video elements have all visual information also contained in the audio", t => {
  const video = (
    <video controls>
      <source
        src="../test-assets/rabbit-video/video-with-voiceover.mp4"
        type="video/mp4"
      />
      <source
        src="../test-assets/rabbit-video/video-with-voiceover.webm"
        type="video/webm"
      />
    </video>
  );

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R25,
    { document, device: getDefaultDevice() },
    { passed: [video] },
    [
      {
        rule: SIA_R25,
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R25,
        type: QuestionType.Boolean,
        id: "has-audio",
        aspect: document,
        target: video,
        answer: true
      },
      {
        rule: SIA_R25,
        type: QuestionType.Boolean,
        id: "has-description",
        aspect: document,
        target: video,
        answer: true
      }
    ]
  );
});

test("Fails when non-streaming video elements have no visual information also contained in the audio", t => {
  const video = (
    <video controls>
      <source src="../test-assets/rabbit-video/video.mp4" type="video/mp4" />
      <source src="../test-assets/rabbit-video/video.webm" type="video/webm" />
    </video>
  );

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R25,
    { document, device: getDefaultDevice() },
    { failed: [video] },
    [
      {
        rule: SIA_R25,
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R25,
        type: QuestionType.Boolean,
        id: "has-audio",
        aspect: document,
        target: video,
        answer: true
      },
      {
        rule: SIA_R25,
        type: QuestionType.Boolean,
        id: "has-description",
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
    SIA_R25,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable,
    [
      {
        rule: SIA_R25,
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: img,
        answer: false
      },
      {
        rule: SIA_R25,
        type: QuestionType.Boolean,
        id: "has-audio",
        aspect: document,
        target: img,
        answer: true
      },
      {
        rule: SIA_R25,
        type: QuestionType.Boolean,
        id: "has-description",
        aspect: document,
        target: img,
        answer: true
      }
    ]
  );
});

test("Cannot tell when no answers are passed", t => {
  const video = (
    <video controls>
      <source src="../test-assets/rabbit-video/video.mp4" type="video/mp4" />
      <source src="../test-assets/rabbit-video/video.webm" type="video/webm" />
    </video>
  );

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R25,
    { document, device: getDefaultDevice() },
    { cantTell: [video] }
  );
});
