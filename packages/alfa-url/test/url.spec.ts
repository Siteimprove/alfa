import { test } from "@siteimprove/alfa-test";

import { URL } from "../src/url";

test(".parse() parses an absolute URL", (t) => {
  t.deepEqual(URL.parse("https://example.com/page.html").getUnsafe().toJSON(), {
    scheme: "https",
    username: null,
    password: null,
    host: "example.com",
    port: null,
    path: ["page.html"],
    query: null,
    fragment: null,
    cannotBeABase: false,
  });
});

test(".parse() parses a relative URL against a base URL", (t) => {
  t.deepEqual(URL.parse("/page.html", "https://example.com/").getUnsafe().toJSON(), {
    scheme: "https",
    username: null,
    password: null,
    host: "example.com",
    port: null,
    path: ["page.html"],
    query: null,
    fragment: null,
    cannotBeABase: false,
  });
});

test(".parse() parses the about:blank URL", (t) => {
  t.deepEqual(URL.parse("about:blank").getUnsafe().toJSON(), {
    scheme: "about",
    username: null,
    password: null,
    host: null,
    port: null,
    path: ["blank"],
    query: null,
    fragment: null,
    cannotBeABase: true,
  });
});

test(".parse() parses the about:/blank URL", (t) => {
  t.deepEqual(URL.parse("about:/blank").getUnsafe().toJSON(), {
    scheme: "about",
    username: null,
    password: null,
    host: null,
    port: null,
    path: ["blank"],
    query: null,
    fragment: null,
    cannotBeABase: false,
  });
});

test(".parse() parses a file: URL", (t) => {
  t.deepEqual(URL.parse("file:///foo").getUnsafe().toJSON(), {
    scheme: "file",
    username: null,
    password: null,
    host: "",
    port: null,
    path: ["foo"],
    query: null,
    fragment: null,
    cannotBeABase: false,
  });
});

test("#toString() stringifies the about:blank URL", (t) => {
  t.equal(URL.parse("about:blank").getUnsafe().toString(), "about:blank");
});

test("#toString() stringifies the about:/blank URL", (t) => {
  t.equal(URL.parse("about:/blank").getUnsafe().toString(), "about:/blank");
});

test("#toString() stringifies a file: URL", (t) => {
  t.equal(URL.parse("file:///foo").getUnsafe().toString(), "file:///foo");
});

test("#equals() checks if two URLs are equal", (t) => {
  const a = URL.parse("foo", "file:").getUnsafe();
  const b = URL.parse("foo", "file:").getUnsafe();
  const c = URL.parse("bar", "file:").getUnsafe();

  t.equal(a.equals(a), true);
  t.equal(a.equals(b), true);
  t.equal(a.equals(c), false);
});
