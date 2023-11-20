import { test } from "@siteimprove/alfa-test";

import { parseErr, serialize } from "./parser";

test(".parse() parses a pseudo-element selector", (t) => {
  t.deepEqual(serialize("::before"), {
    type: "pseudo-element",
    name: "before",
  });

  t.deepEqual(serialize(":before"), {
    type: "pseudo-element",
    name: "before",
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
      value: { type: "universal", namespace: null },
    },
  });

  t.deepEqual(serialize("::cue"), {
    type: "pseudo-element",
    name: "cue",
    selector: {
      type: "none",
    },
  });
});

test(".parse() only allows pseudo-element selectors as the last selector", (t) => {
  t.equal(parseErr("::foo.foo").isErr(), true);
  t.equal(parseErr("::foo+foo").isErr(), true);
});
