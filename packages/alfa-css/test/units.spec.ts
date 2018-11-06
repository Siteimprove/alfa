import { test } from "@siteimprove/alfa-test";
import { Units } from "../src/units";

test("Returns true when length is of absolute unit", t => {
  t(Units.isAbsoluteLength("cm"));
  t(!Units.isAbsoluteLength("em"));
  t(!Units.isAbsoluteLength("dpi"));
});

test("Returns true when length is of relative unit", t => {
  t(!Units.isRelativeLength("cm"));
  t(Units.isRelativeLength("em"));
  t(!Units.isRelativeLength("dpi"));
});

test("Returns true when length is a length unit", t => {
  t(Units.isLength("cm"));
  t(!Units.isLength("dpi"));
});
