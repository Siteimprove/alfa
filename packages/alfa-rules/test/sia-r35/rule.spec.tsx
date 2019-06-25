import { QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R26 } from "../../src/sia-r26/rule";
import { SIA_R32 } from "../../src/sia-r32/rule";
import { SIA_R33 } from "../../src/sia-r33/rule";
import { SIA_R34 } from "../../src/sia-r34/rule";
import { SIA_R35 } from "../../src/sia-r35/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when composite rules are passing", t => {
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
    SIA_R35,
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
      },
      {
        rule: SIA_R32,
        type: QuestionType.Boolean,
        id: "has-audio-track",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R33,
        type: QuestionType.Boolean,
        id: "has-transcript",
        aspect: document,
        target: video,
        answer: false
      },
      {
        rule: SIA_R34,
        type: QuestionType.Boolean,
        id: "track-describes-video",
        aspect: document,
        target: video,
        answer: false
      }
    ]
  );
});
