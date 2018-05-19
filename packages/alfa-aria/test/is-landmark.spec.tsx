import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { isLandmark } from "../src/is-landmark";

test("Returns true when an element is a landmark", t => {
  const banner = <div role="banner" />;
  t.true(isLandmark(banner, banner));
});

test("Returns false when an element is not a landmark", t => {
  const button = <div role="button" />;
  t.false(isLandmark(button, button));
});

test("Does not consider abstract roles", t => {
  const landmark = <div role="landmark" />;
  t.false(isLandmark(landmark, landmark));
});
