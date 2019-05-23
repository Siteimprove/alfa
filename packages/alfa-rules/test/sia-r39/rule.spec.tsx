import { Outcome, QuestionType } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R39 } from "../../src/sia-r39/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when image source has valid accessible name", t => {
  const img = <img src="foo" alt="foo" />;

  const document = documentFromNodes([<div>{img}</div>]);

  outcome(
    t,
    SIA_R39,
    { document, device: getDefaultDevice() },
    { passed: [img] },
    [
      {
        rule: SIA_R39,
        type: QuestionType.Boolean,
        id: "name-describes-image",
        aspect: document,
        target: img,
        answer: true
      }
    ]
  );
});

test("Fails when image source has no valid accessible name", t => {
  const img = <img src="foo.jpg?bar=baz" alt="foo.jpg" />;

  const document = documentFromNodes([<div>{img}</div>]);

  outcome(
    t,
    SIA_R39,
    { document, device: getDefaultDevice() },
    { failed: [img] },
    [
      {
        rule: SIA_R39,
        type: QuestionType.Boolean,
        id: "name-describes-image",
        aspect: document,
        target: img,
        answer: false
      }
    ]
  );
});

test("Inapplicable when image has no source", t => {
  const img = <img src="" alt="foo.jpg" />;

  const document = documentFromNodes([<div>{img}</div>]);

  outcome(
    t,
    SIA_R39,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable,
    [
      {
        rule: SIA_R39,
        type: QuestionType.Boolean,
        id: "name-describes-image",
        aspect: document,
        target: img,
        answer: false
      }
    ]
  );
});

test("Inapplicable when element is not an image", t => {
  const video = <video src="foo.mp4" />;

  const document = documentFromNodes([<div>{video}</div>]);

  outcome(
    t,
    SIA_R39,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable,
    [
      {
        rule: SIA_R39,
        type: QuestionType.Boolean,
        id: "name-describes-image",
        aspect: document,
        target: video,
        answer: false
      }
    ]
  );
});
