// import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R22 } from "../../src/sia-r22/rule";
import { SIA_R26 } from "../../src/sia-r26/rule";
import { SIA_R27 } from "../../src/sia-r27/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R27 passes when video elements have an alternative for information conveyed through audio", t => {
  const video = (
    <video
      src="../test-assets/perspective-video/perspective-video.mp4"
      controls
    >
      <track
        src="/test-assets/perspective-video/perspective-caption.vtt"
        kind="captions"
      />
    </video>
  );

  const document = documentFromNodes([video]);

  const answers = [
    {
      rule: SIA_R22,
      expectation: 1,
      aspect: document,
      target: video,
      answer: true
    },
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
    SIA_R27,
    { document, device: getDefaultDevice() },
    { passed: [video] },
    answers
  );
});
