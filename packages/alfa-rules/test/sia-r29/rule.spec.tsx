import { Outcome, QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R29 } from "../../src/sia-r29/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when non-streaming audio has a media alternative for text on the page", t => {
  const audio = <audio src="foo.mp4" controls />;

  const textAlternative = <p>Foo bar?</p>;

  const document = documentFromNodes([
    <div>
      {audio}
      {textAlternative}
    </div>
  ]);

  outcome(
    t,
    SIA_R29,
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
        rule: SIA_R29,
        type: QuestionType.Node,
        id: "text-alternative",
        aspect: document,
        target: audio,
        answer: textAlternative
      },
      {
        rule: SIA_R29,
        type: QuestionType.Node,
        id: "label",
        aspect: document,
        target: audio,
        answer: textAlternative
      }
    ]
  );
});

test("Fails when non-streaming audio has no media alternative for text on the page", t => {
  const audio = (
    <audio controls>
      <source src="foo.mp4" type="audio/mp4" />
    </audio>
  );

  const document = documentFromNodes([audio]);

  outcome(
    t,
    SIA_R29,
    { document, device: getDefaultDevice() },
    { failed: [audio] },
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

test("Is inapplicable when element is not a audio element", t => {
  const img = <img src="foo.mp4" />;

  const document = documentFromNodes([img]);

  outcome(
    t,
    SIA_R29,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable,
    [
      {
        type: QuestionType.Boolean,
        id: "is-streaming",
        aspect: document,
        target: img,
        answer: false
      },
      {
        type: QuestionType.Boolean,
        id: "is-playing",
        aspect: document,
        target: img,
        answer: true
      },
      {
        rule: SIA_R29,
        type: QuestionType.Node,
        id: "text-alternative",
        aspect: document,
        target: img,
        answer: null
      },
      {
        rule: SIA_R29,
        type: QuestionType.Node,
        id: "label",
        aspect: document,
        target: img,
        answer: null
      }
    ]
  );
});

test("Cannot tell when no answers are passed", t => {
  const audio = (
    <audio controls>
      <source src="foo.mp4" type="audio/mp4" />
    </audio>
  );

  const document = documentFromNodes([audio]);

  outcome(
    t,
    SIA_R29,
    { document, device: getDefaultDevice() },
    { cantTell: [audio] }
  );
});
