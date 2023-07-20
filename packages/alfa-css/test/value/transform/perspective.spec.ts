import { test } from "@siteimprove/alfa-test";

import { Length, Perspective } from "../../../src";

import { parser, serializer } from "../../common/parse";

const serialize = serializer(Perspective.parse);

test("parse() parses a perspective", (t) => {
  const actual = serialize("perspective(1px)");

  t.deepEqual(actual, {
    type: "transform",
    kind: "perspective",
    depth: { type: "length", unit: "px", value: 1 },
  });
});

test("parse() parses a perspective with calculation", (t) => {
  const actual = serialize("perspective(calc(1em + 2px))");

  t.deepEqual(actual, {
    type: "transform",
    kind: "perspective",
    depth: {
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
                  value: { type: "length", unit: "em", value: 1 },
                },
                {
                  type: "value",
                  value: { type: "length", unit: "px", value: 2 },
                },
              ],
            },
          ],
        },
      },
    },
  });
});

test("resolve() resolves a perspective", (t) => {
  const actual = parser(Perspective.parse)("perspective(calc(1em + 2px))");

  t.deepEqual(
    actual
      .getUnsafe()
      .resolve({
        length: Length.resolver(
          Length.of(16, "px"),
          Length.of(16, "px"),
          Length.of(16, "px"),
          Length.of(16, "px")
        ),
      })
      .toJSON(),
    {
      type: "transform",
      kind: "perspective",
      depth: { type: "length", unit: "px", value: 18 },
    }
  );
});
