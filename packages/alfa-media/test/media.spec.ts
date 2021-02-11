/// <reference lib="dom" />

import { test } from "@siteimprove/alfa-test";

import { Media } from "../src";

test("parse() parses (orientation: portrait)", (t) => {
  t.deepEqual(Media.parse("(orientation: portrait)").get().toJSON(), [
    {
      type: "query",
      modifier: null,
      mediaType: null,
      condition: {
        type: "feature",
        name: "orientation",
        value: {
          type: "string",
          value: "portrait",
        },
      },
    },
  ]);
});
