import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R26 } from "../../src/sia-r26/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R26 passes when non-streaming silent video has a media alternative for text on the page", t => {
  const video = (
    <video
      src="../test-assets/perspective-video/perspective-video-with-captions-silent.mp4"
      controls
    />
  );

  const document = documentFromNodes([
    <div>
      {video}
      <p>
        Not being able to use your computer because your mouse doesn't work, is
        frustrating. Many people use only the keyboard to navigate websites.
        Either through preference or circumstance. This is solved by keyboard
        compatibility. Keyboard compatibility is described in WCAG. See the
        video below to watch the same information again in video form.
      </p>
    </div>
  ]);

  const answers = [
    {
      rule: SIA_R26,
      expectation: 1,
      aspect: document,
      target: video,
      answer: true
    },
    {
      rule: SIA_R26,
      expectation: 2,
      aspect: document,
      target: video,
      answer: true
    },
    {
      rule: SIA_R26,
      expectation: 3,
      aspect: document,
      target: video,
      answer: true
    }
  ];

  outcome(
    t,
    SIA_R26,
    { document, device: getDefaultDevice() },
    { passed: [video] },
    answers
  );
});

test("SIA-R26 fails when non-streaming silent video has no media alternative for text on the page", t => {
  const video = (
    <video controls>
      <source src="../test-assets/rabbit-video/video.mp4" type="video/mp4" />
      <source src="../test-assets/rabbit-video/video.webm" type="video/webm" />
    </video>
  );

  const document = documentFromNodes([video]);

  const answers = [
    {
      rule: SIA_R26,
      expectation: 1,
      aspect: document,
      target: video,
      answer: false
    },
    {
      rule: SIA_R26,
      expectation: 2,
      aspect: document,
      target: video,
      answer: false
    },
    {
      rule: SIA_R26,
      expectation: 3,
      aspect: document,
      target: video,
      answer: false
    }
  ];

  outcome(
    t,
    SIA_R26,
    { document, device: getDefaultDevice() },
    { failed: [video] },
    answers
  );
});

test("SIA-R26 is inapplicable when element is not a video element", t => {
  const img = (
    <img src="../test-assets/perspective-video/perspective-video-with-captions.mp4" />
  );
  const document = documentFromNodes([img]);

  const answers = [
    {
      rule: SIA_R26,
      expectation: 1,
      aspect: document,
      target: img,
      answer: false
    },
    {
      rule: SIA_R26,
      expectation: 1,
      aspect: document,
      target: img,
      answer: false
    },
    {
      rule: SIA_R26,
      expectation: 1,
      aspect: document,
      target: img,
      answer: false
    }
  ];

  outcome(
    t,
    SIA_R26,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable,
    answers
  );
});

test("SIA-R26 can't tell when no answers are passed", t => {
  const video = (
    <video controls>
      <source src="../test-assets/rabbit-video/video.mp4" type="video/mp4" />
      <source src="../test-assets/rabbit-video/video.webm" type="video/webm" />
    </video>
  );

  const document = documentFromNodes([video]);

  outcome(
    t,
    SIA_R26,
    { document, device: getDefaultDevice() },
    { cantTell: [video] },
    []
  );
});
