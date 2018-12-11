import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R22 } from "../../src/sia-r22/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R22 passes when captions are available for audio information in non-streaming video elements", t => {
  const video = (
    <video
      src="../test-assets/perspective-video/perspective-video-with-captions.mp4"
      controls
    />
  );
  const document = documentFromNodes([video]);

  const answers = [
    {
      rule: SIA_R22,
      expectation: 1,
      aspect: document,
      target: video,
      answer: true
    }
  ];

  outcome(
    t,
    SIA_R22,
    { document, device: getDefaultDevice() },
    { passed: [video] },
    answers
  );
});

test("SIA-R22 fails when no captions are available for audio information in non-streaming video elements", t => {
  const video = (
    <video
      src="../test-assets/perspective-video/perspective-video-with-captions.mp4"
      controls
    />
  );
  const document = documentFromNodes([video]);

  const answers = [
    {
      rule: SIA_R22,
      expectation: 1,
      aspect: document,
      target: video,
      answer: false
    }
  ];

  outcome(
    t,
    SIA_R22,
    { document, device: getDefaultDevice() },
    { failed: [video] },
    answers
  );
});

test("SIA-R22 is inapplicable when element is not a video element", t => {
  const img = (
    <img src="../test-assets/perspective-video/perspective-video-with-captions.mp4" />
  );
  const document = documentFromNodes([img]);

  const answers = [
    {
      rule: SIA_R22,
      expectation: 1,
      aspect: document,
      target: img,
      answer: false
    }
  ];

  outcome(
    t,
    SIA_R22,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable,
    answers
  );
});

test("SIA-R22 can't tell when no answers are passed", t => {
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
    { cantTell: [video] },
    []
  );
});
