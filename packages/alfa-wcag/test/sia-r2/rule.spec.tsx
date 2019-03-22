import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R2 } from "../../src/sia-r2/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when an image has a text alternative", t => {
  const image = (
    <img src="https://picsum.photos/200/300" alt="A placeholder image" />
  );
  const div = (
    <div
      role="img"
      style="width: 200px; height: 300px; background-image: url(https://picsum.photos/200/300)"
      aria-label="A placeholder image"
    />
  );
  const document = documentFromNodes([image, div]);

  outcome(
    t,
    SIA_R2,
    { document, device: getDefaultDevice() },
    { passed: [image, div] }
  );
});

test("Fails when an image has no text alternative", t => {
  const image = <img src="https://picsum.photos/200/300" />;
  const document = documentFromNodes([image]);

  outcome(
    t,
    SIA_R2,
    { document, device: getDefaultDevice() },
    { failed: [image] }
  );
});

test("Passes when an image is marked as decorative", t => {
  const image = <img src="https://picsum.photos/200/300" role="presentation" />;
  const document = documentFromNodes([image]);

  outcome(
    t,
    SIA_R2,
    { document, device: getDefaultDevice() },
    { passed: [image] }
  );
});

test("Is inapplicable when no images are present", t => {
  const document = documentFromNodes([<div />]);

  outcome(
    t,
    SIA_R2,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
