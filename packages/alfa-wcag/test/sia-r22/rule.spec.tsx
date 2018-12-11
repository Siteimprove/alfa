// import { Outcome} from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R22 } from "../../src/sia-r22/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R22 passes when role attributes have valid values", t => {
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
