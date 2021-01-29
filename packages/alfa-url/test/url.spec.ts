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
    cannotBeABaseURL: false,
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
    cannotBeABaseURL: false,
  });
});

test(".parse() parses the special about:blank URL", (t) => {
  t.deepEqual(URL.parse("about:blank").get().toJSON(), {
    scheme: "about",
    username: null,
    password: null,
    host: null,
    port: null,
    path: ["blank"],
    query: null,
    fragment: null,
    cannotBeABaseURL: false,
  });
});

test(".parse() parses the special about:blank URL", (t) => {
  const a = URL.parse("about:blank").get().toString();
  const b = "about:blank";

  t.equal(a === b, true);
});

test("#equals() checks if two URLs are equal", (t) => {
  const a = URL.parse("foo", "file:").get();
  const b = URL.parse("foo", "file:").get();
  const c = URL.parse("bar", "file:").get();

  t.equal(a.equals(a), true);
  t.equal(a.equals(b), true);
  t.equal(a.equals(c), false);
});
