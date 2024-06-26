import { test } from "@siteimprove/alfa-test";

import { parseErr, serialize } from "./parser.js";

test(".parse() parses a pseudo-element selector", (t) => {
  t.deepEqual(serialize("::before"), {
    type: "pseudo-element",
    name: "before",
    specificity: { a: 0, b: 0, c: 1 },
  });

  t.deepEqual(serialize(":before"), {
    type: "pseudo-element",
    name: "before",
    specificity: { a: 0, b: 0, c: 1 },
  });
});

test(`.parse() requires double colons on non-legacy pseudo-element selectors`, (t) => {
  t.deepEqual(parseErr(":backdrop").isErr(), true);
});

test(`.parse() parses ::cue both as functional and non-functional selector`, (t) => {
  t.deepEqual(serialize("::cue(*)"), {
    type: "pseudo-element",
    name: "cue",
    selector: {
      type: "some",
      value: {
        type: "universal",
        namespace: null,
        specificity: { a: 0, b: 0, c: 0 },
      },
    },
    specificity: { a: 0, b: 0, c: 1 },
  });

  t.deepEqual(serialize("::cue"), {
    type: "pseudo-element",
    name: "cue",
    selector: {
      type: "none",
    },
    specificity: { a: 0, b: 0, c: 1 },
  });
});
