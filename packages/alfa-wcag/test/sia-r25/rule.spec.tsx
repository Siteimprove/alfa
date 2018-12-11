import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R25 } from "../../src/sia-r25/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R25 passes when non-streaming video elements have all visual information also contained in the audio", t => {
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

  const answers = [
    {
      rule: SIA_R25,
      expectation: 1,
      aspect: document,
      target: video,
      answer: true
    }
  ];

  outcome(
    t,
    SIA_R25,
    { document, device: getDefaultDevice() },
    { passed: [video] },
    answers
  );
});

test("SIA-R25 fails when non-streaming video elements have no visual information also contained in the audio", t => {
  const video = (
    <video controls>
      <source src="../test-assets/rabbit-video/video.mp4" type="video/mp4" />
      <source src="../test-assets/rabbit-video/video.webm" type="video/webm" />
    </video>
  );

  const document = documentFromNodes([video]);

  const answers = [
    {
      rule: SIA_R25,
      expectation: 1,
      aspect: document,
      target: video,
      answer: false
    }
  ];

  outcome(
    t,
    SIA_R25,
    { document, device: getDefaultDevice() },
    { failed: [video] },
    answers
  );
});

test("SIA-R25 is inapplicable when element is not a video element", t => {
  const img = (
    <img src="../test-assets/perspective-video/perspective-video-with-captions.mp4" />
  );
  const document = documentFromNodes([img]);

  const answers = [
    {
      rule: SIA_R25,
      expectation: 1,
      aspect: document,
      target: img,
      answer: false
    }
  ];

  outcome(
    t,
    SIA_R25,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable,
    answers
  );
});

test("SIA-R25 can't tell when no answers are passed", t => {
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
    { cantTell: [video] },
    []
  );
});
