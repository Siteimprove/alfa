import { test } from "@siteimprove/alfa-test";

import { Perspective } from "../../../src";

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
