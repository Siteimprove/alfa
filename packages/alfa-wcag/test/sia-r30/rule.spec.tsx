import { QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R23 } from "../../src/sia-r23/rule";
import { SIA_R29 } from "../../src/sia-r29/rule";
import { SIA_R30 } from "../../src/sia-r30/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when composite rules are passing", t => {
  const audio = <audio src="foo.mp4" controls />;

  const transcript = <p>Foo bar?</p>;

  const document = documentFromNodes([
    <div>
      {audio}
      {transcript}
    </div>
  ]);

  outcome(
    t,
    SIA_R30,
    { document, device: getDefaultDevice() },
    { passed: [audio] },
    [
      {
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: audio,
        answer: false
      },
      {
        type: QuestionType.Boolean,
        id: "is-playing",
        aspect: document,
        target: audio,
        answer: true
      },
      {
        rule: SIA_R23,
        type: QuestionType.Boolean,
        id: "has-transcript",
        aspect: document,
        target: audio,
        answer: true
      },
      {
        rule: SIA_R29,
        type: QuestionType.Node,
        id: "text-alternative",
        aspect: document,
        target: audio,
        answer: false
      },
      {
        rule: SIA_R29,
        type: QuestionType.Node,
        id: "label",
        aspect: document,
        target: audio,
        answer: false
      }
    ]
  );
});
