import { test } from "@siteimprove/alfa-test";

import { Language } from "../dist/language";

test(".parse() parses a primary language tag", (t) => {
  t.deepEqual(Language.parse("da").getUnsafe().toJSON(), {
    type: "language",
    primary: {
      type: "primary",
      name: "da",
      scope: null,
    },
    extended: null,
    script: null,
    region: null,
    variants: [],
  });
});

test(".parse() parses a primary language tag with a region", (t) => {
  t.deepEqual(Language.parse("da-DK").getUnsafe().toJSON(), {
    type: "language",
    primary: {
      type: "primary",
      name: "da",
      scope: null,
    },
    extended: null,
    script: null,
    region: {
      type: "region",
      name: "dk",
    },
    variants: [],
  });
});
