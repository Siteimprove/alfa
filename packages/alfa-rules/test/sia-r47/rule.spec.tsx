import { Outcome } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import {
  parseMaximumScale,
  parsePropertiesList,
  parseUserScalable,
  SIA_R47
} from "../../src/sia-r47/rule";
import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Parses comma and semi-colon separated name=value list", t => {
  const actual = parsePropertiesList(
    "prop1=1, ignored; , prop2= ==2; prop3 ignored=  3, ignored",
    [" "],
    [",", ";"],
    ["="]
  );
  const expected = new Map<String, string>();
  expected.set("prop1", "1");
  expected.set("prop2", "2");
  expected.set("prop3", "3");

  t.deepEqual(actual, expected, "Maps should be the same");
});

test("Correctly parses user-scalable values", t => {
  t.equal(parseUserScalable(undefined), null);
  t.equal(parseUserScalable("yes"), "zoom");
  t.equal(parseUserScalable("device-width"), "zoom");
  t.equal(parseUserScalable("device-height"), "zoom");
  t.equal(parseUserScalable("6"), "zoom");

  t.equal(parseUserScalable("no"), "fixed");
  t.equal(parseUserScalable("0.1"), "fixed");
  t.equal(parseUserScalable("tesruina"), "fixed");
});

test("Correctly parses maximum-scale values", t => {
  t.equal(parseMaximumScale(undefined), null);
  t.equal(parseMaximumScale("1"), 1);
  t.equal(parseMaximumScale("yes"), 1);
  t.equal(parseMaximumScale("device-width"), 10);
  t.equal(parseMaximumScale("device-height"), 10);
  t.equal(parseMaximumScale("no"), 0.1);
  t.equal(parseMaximumScale("qsrnuq"), 0.1);
  t.equal(parseMaximumScale("17"), 10);
  t.equal(parseMaximumScale("-54"), 0.1);
});

const body = (
  <body>
    <p>Lorem ipsum</p>
    <svg></svg>
  </body>
);
const head = (meta: Element) => <head>{meta}</head>;
const document = (meta: Element) => ({
  document: documentFromNodes([head(meta), body])
});

test("Pass when content defines neither scale nor scalable", t => {
  const meta1 = <meta name="viewport" content="" />;
  const meta2 = <meta name="viewport" content="width=device-width" />;

  outcome(t, SIA_R47, document(meta1), { passed: [meta1] });
  outcome(t, SIA_R47, document(meta2), { passed: [meta2] });
});

test("Pass when user-scalable is set to any 'zoom' value", t => {
  const meta1 = (
    <meta name="viewport" content="width=device-width, user-scalable=yes" />
  );
  const meta2 = <meta name="viewport" content="user-scalable=6" />;

  outcome(t, SIA_R47, document(meta1), { passed: [meta1] });
  outcome(t, SIA_R47, document(meta2), { passed: [meta2] });
});

test("Pass when maximum-scale is set to any value larger than 2", t => {
  const meta1 = (
    <meta name="viewport" content="width=device-width, maximum-scale=6.0" />
  );
  const meta2 = <meta name="viewport" content="maximum-scale=device-width" />;

  outcome(t, SIA_R47, document(meta1), { passed: [meta1] });
  outcome(t, SIA_R47, document(meta2), { passed: [meta2] });
});

test("Passes when both user-scalable and maximum-scale are correct", t => {
  const meta = (
    <meta name="viewport" content="maximum-scale=6.0, user-scalable=yes" />
  );

  outcome(t, SIA_R47, document(meta), { passed: [meta] });
});

test("Fails when user-scalable or maximum-scale are not correct", t => {
  const meta1 = <meta name="viewport" content="maximum-scale=1.3" />;
  const meta2 = <meta name="viewport" content="maximum-scale=no" />;
  const meta3 = <meta name="viewport" content="user-scalable=no" />;
  const meta4 = (
    <meta name="viewport" content="maximum-scale=1.5, user-scalable=yes" />
  );
  const meta5 = (
    <meta name="viewport" content="maximum-scale=5, user-scalable=no" />
  );

  outcome(t, SIA_R47, document(meta1), { failed: [meta1] });
  outcome(t, SIA_R47, document(meta2), { failed: [meta2] });
  outcome(t, SIA_R47, document(meta3), { failed: [meta3] });
  outcome(t, SIA_R47, document(meta4), { failed: [meta4] });
  outcome(t, SIA_R47, document(meta5), { failed: [meta5] });
});

test("Is inapplicable when no meta viewport attribute are present", t => {
  const meta = (
    <meta http-equiv="refresh" content="10; URL='https://github.com'" />
  );

  outcome(t, SIA_R47, document(meta), Outcome.Inapplicable);
});

test("Is inapplicable when the meta viewport attribute has no content", t => {
  const meta = <meta name="viewport" />;

  outcome(t, SIA_R47, document(meta), Outcome.Inapplicable);
});
