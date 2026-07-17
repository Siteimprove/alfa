import { test } from "@siteimprove/alfa-test";

import type { Length } from "../../../src/index.ts";
import { Rectangle } from "../../../src/index.ts";
import { parser, serializer } from "../../common/parse.ts";

const parseErr = parser(Rectangle.parse);
const serialize = serializer(Rectangle.parse);
const parseLegacyErr = parser(Rectangle.parseLegacy);
const serializeLegacy = serializer(Rectangle.parseLegacy);

test(".parse() parses comma separated rectangles", (t) => {
  t.deepEqual(serialize("rect(1px, auto, 2em, auto)"), {
    type: "basic-shape",
    kind: "rectangle",
    bottom: { type: "length", unit: "em", value: 2 },
    left: { type: "keyword", value: "auto" },
    right: { type: "keyword", value: "auto" },
    top: { type: "length", unit: "px", value: 1 },
  });

  t.deepEqual(serialize("rect(1px , auto , 2em,auto)"), {
    type: "basic-shape",
    kind: "rectangle",
    bottom: { type: "length", unit: "em", value: 2 },
    left: { type: "keyword", value: "auto" },
    right: { type: "keyword", value: "auto" },
    top: { type: "length", unit: "px", value: 1 },
  });
});

test(".parse() doesn't parse space separated rectangles", (t) => {
  t(parseErr("rect(1px auto 2em auto)").isErr());
});

test(".parseLegacy() parses comma separated rectangles", (t) => {
  t.deepEqual(serializeLegacy("rect(1px, auto, 2em, auto)"), {
    type: "basic-shape",
    kind: "rectangle",
    bottom: { type: "length", unit: "em", value: 2 },
    left: { type: "keyword", value: "auto" },
    right: { type: "keyword", value: "auto" },
    top: { type: "length", unit: "px", value: 1 },
  });

  t.deepEqual(serializeLegacy("rect(1px , auto , 2em,auto)"), {
    type: "basic-shape",
    kind: "rectangle",
    bottom: { type: "length", unit: "em", value: 2 },
    left: { type: "keyword", value: "auto" },
    right: { type: "keyword", value: "auto" },
    top: { type: "length", unit: "px", value: 1 },
  });
});

test(".parseLegacy() parses space separated rectangles", (t) => {
  t.deepEqual(serializeLegacy("rect(1px auto 2em auto)"), {
    type: "basic-shape",
    kind: "rectangle",
    bottom: { type: "length", unit: "em", value: 2 },
    left: { type: "keyword", value: "auto" },
    right: { type: "keyword", value: "auto" },
    top: { type: "length", unit: "px", value: 1 },
  });
});

test(".parseLegacy() fails when mixing comma and space separators", (t) => {
  t.deepEqual(parseLegacyErr("rect(1px 1px, 1px 1px").isErr(), true);
});

test(".parse() fails if there are more or less than 4 values", (t) => {
  t.deepEqual(parseErr("rect(1px 1px 1px").isErr(), true);

  t.deepEqual(parseErr("rect(1px 1px 1px 1px 1px").isErr(), true);
});

test(".parse() accepts calculated lengths", (t) => {
  const actual = (length: number) => `calc(${length}px + 1em)`;
  const expected: (length: number) => Length.JSON = (length: number) => ({
    type: "length",
    math: {
      type: "math expression",
      expression: {
        type: "calculation",
        arguments: [
          {
            type: "sum",
            operands: [
              {
                type: "value",
                value: { type: "length", value: length, unit: "px" },
              },
              {
                type: "value",
                value: { type: "length", value: 1, unit: "em" },
              },
            ],
          },
        ],
      },
    },
  });

  t.deepEqual(
    serialize(`rect(${actual(1)}, ${actual(2)}, ${actual(3)}, ${actual(4)})`),
    {
      type: "basic-shape",
      kind: "rectangle",
      top: expected(1),
      right: expected(2),
      bottom: expected(3),
      left: expected(4),
    },
  );
});
