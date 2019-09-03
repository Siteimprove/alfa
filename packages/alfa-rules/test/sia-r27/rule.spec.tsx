import { QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R22 } from "../../src/sia-r22/rule";
import { SIA_R27 } from "../../src/sia-r27/rule";
import { SIA_R31 } from "../../src/sia-r31/rule";

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
    SIA_R27,
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
        rule: SIA_R22,
        id: "has-captions",
        type: QuestionType.Boolean,
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
        answer: textAlternative
      },
      {
        rule: SIA_R31,
        type: QuestionType.Node,
        id: "label",
        aspect: document,
        target: video,
        answer: textAlternative
      }
    ]
  );
});
