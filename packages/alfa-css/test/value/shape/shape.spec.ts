import { test } from "@siteimprove/alfa-test";

import { Shape } from "../../../src/value/shape/index.ts";

import { parser, parserUnsafe, serializer } from "../../common/parse.ts";

const parseErr = parser(Shape.parse);
const serialize = serializer(Shape.parse);

test(".parse() parses <basic-shape> <geometry-box>", (t) => {
  t.deepEqual(serialize("inset(1px) padding-box"), {
    type: "shape",
    box: {
      type: "keyword",
      value: "padding-box",
    },
    shape: {
      type: "basic-shape",
      kind: "inset",
      offsets: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
      corners: {
        type: "none",
      },
    },
  });
});

test(".parse() parses <geometry-box> <basic-shape>", (t) => {
  t.deepEqual(serialize("margin-box inset(1px)"), {
    type: "shape",
    box: {
      type: "keyword",
      value: "margin-box",
    },
    shape: {
      type: "basic-shape",
      kind: "inset",
      offsets: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
      corners: {
        type: "none",
      },
    },
  });
});

test(".parse() parses <basic-shape>", (t) => {
  t.deepEqual(serialize("inset(1px)"), {
    type: "shape",
    box: {
      type: "keyword",
      value: "border-box",
    },
    shape: {
      type: "basic-shape",
      kind: "inset",
      offsets: [
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
        { type: "length", value: 1, unit: "px" },
      ],
      corners: {
        type: "none",
      },
    },
  });
});

test(".parse() fails if no <basic-shape> is provided", (t) => {
  t.deepEqual(parseErr("margin-box").isErr(), true);
});

/*********************************************************************
 *
 * Shape.isEmpty()
 *
 *********************************************************************/

const parse = (input: string) => parserUnsafe(Shape.parse)(input).shape;

test("isEmpty() returns true for a circle of provable 0 radius", (t) => {
  for (const shape of [
    parse("circle(0)"),
    parse("circle(0px)"),
    parse("circle(0%)"),
  ]) {
    t(Shape.isEmpty(shape));
  }
});

test("isEmpty() returns false for a circle that isn't provably of 0 radius", (t) => {
  for (const shape of [
    parse("circle(closest-side)"),
    parse("circle(1px)"),
    parse("circle(20%)"),
  ]) {
    t(!Shape.isEmpty(shape));
  }
});

test("isEmpty() returns true for an ellipse with either radius of provable 0", (t) => {
  for (const shape of [
    parse("ellipse(0px 10px at center)"),
    parse("ellipse(10px 0px at center)"),
    parse("ellipse(0% 10% at center)"),
  ]) {
    t(Shape.isEmpty(shape));
  }
});

test("isEmpty() returns false for an ellipse with no radius provably 0", (t) => {
  for (const shape of [
    parse("ellipse(10px 10px at center)"),
    parse("ellipse(closest-side closest-side at center)"),
  ]) {
    t(!Shape.isEmpty(shape));
  }
});

test("isEmpty() returns true for a polygon with a one or two vertices", (t) => {
  for (const shape of [
    parse("polygon(0px 0px)"),
    parse("polygon(nonzero, 10px 10px)"),
    parse("polygon(0px 0px 10px 10px)"),
  ]) {
    t(Shape.isEmpty(shape));
  }
});

test("isEmpty() returns true for a polygon whose vertices are all identical", (t) => {
  for (const shape of [
    parse("polygon(10px 10px 10px 10px 10px 10px)"),
    parse("polygon(evenodd, 10px 10px 10px 10px 10px 10px)"),
  ]) {
    t(Shape.isEmpty(shape));
  }
});

test("isEmpty() returns false for a polygon with several distinct vertices", (t) => {
  for (const shape of [
    parse("polygon(0px 0px 10px 0px 10px 10px)"),
    parse("polygon(evenodd, 0px 0px 10px 0px 10px 10px)"),
    // Two out of three vertices coincide, but not all of them.
    parse("polygon(0px 0px 0px 0px 10px 10px)"),
  ]) {
    t(!Shape.isEmpty(shape));
  }
});

test("isEmpty() returns true for an inset whose opposite offsets sum to at least 100%", (t) => {
  for (const shape of [
    parse("inset(60% 0% 40% 0%)"), // top + bottom
    parse("inset(0% 70% 0% 30%)"), // right + left
    parse("inset(100% 0% 0% 0%)"),
  ]) {
    t(Shape.isEmpty(shape));
  }
});

test("isEmpty() returns false for an inset whose opposite offsets do not sum to 100%", (t) => {
  for (const shape of [
    parse("inset(10% 0% 10% 0%)"),
    parse("inset(40% 40% 40% 40%)"),
    // Offsets are lengths, and we don't know the size of the containing box.
    parse("inset(999px 0px 999px 0px)"),
  ]) {
    t(!Shape.isEmpty(shape));
  }
});

test("isEmpty() returns true for a rectangle with identical top/bottom or left/right offsets", (t) => {
  for (const shape of [
    parse("rect(10px 20px 10px 30px)"), // top === bottom
    parse("rect(10px 20px 30px 20px)"), // right === left
  ]) {
    t(Shape.isEmpty(shape));
  }
});

test("isEmpty() returns false for a rectangle with distinct top/bottom and left/right offsets", (t) => {
  for (const shape of [
    parse("rect(10px 20px 30px 40px)"),
    // "auto" offsets are never fixed, so they can't trigger a match.
    parse("rect(auto 20px auto 40px)"),
  ]) {
    t(!Shape.isEmpty(shape));
  }
});
