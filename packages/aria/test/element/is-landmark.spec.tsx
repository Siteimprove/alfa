import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { isLandmark } from "../../src/element/is-landmark";

test("Returns true when an element is a landmark", async t => {
  t.true(isLandmark(<div role="banner" />));
});

test("Returns false when an element is not a landmark", async t => {
  t.false(isLandmark(<div role="button" />));
});

test("Does not consider abstract roles", async t => {
  t.false(isLandmark(<div role="landmark" />));
});
