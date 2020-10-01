import { test } from "@siteimprove/alfa-test";

import { URL } from "../src/url";

test(".parse() parses an absolute URL", (t) => {
  t.deepEqual(URL.parse("https://example.com/page.html").get().toJSON(), {
    scheme: "https",
    username: null,
    password: null,
    host: "example.com",
    port: null,
    path: ["page.html"],
    query: null,
    fragment: null,
  });
});

test(".parse() parses a relative URL against a base URL", (t) => {
  t.deepEqual(URL.parse("/page.html", "https://example.com/").get().toJSON(), {
    scheme: "https",
    username: null,
    password: null,
    host: "example.com",
    port: null,
    path: ["page.html"],
    query: null,
    fragment: null,
  });
});
