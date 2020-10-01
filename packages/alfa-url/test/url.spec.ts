import { test } from "@siteimprove/alfa-test";

import { None, Option } from "@siteimprove/alfa-option";

import { URL } from "../src/url";

test(".parse() parses an absolute URL", (t) => {
  t.deepEqual(
    URL.parse("https://example.com/page.html").get().toJSON(),
    URL.of(
      "https",
      None,
      None,
      Option.of("example.com"),
      None,
      ["page.html"],
      None,
      None
    ).toJSON()
  );
});

test(".parse() parses a relative URL against a base URL", (t) => {
  t.deepEqual(
    URL.parse("/page.html", "https://example.com/").get().toJSON(),
    URL.of(
      "https",
      None,
      None,
      Option.of("example.com"),
      None,
      ["page.html"],
      None,
      None
    ).toJSON()
  );
});
