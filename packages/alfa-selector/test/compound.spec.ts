import { test } from "@siteimprove/alfa-test";

import { serialize } from "./parser.js";

test(".parse() parses a compound selector", (t) => {
  t.deepEqual(serialize("#foo.bar"), {
    type: "compound",
    selectors: [
      {
        type: "id",
        name: "foo",
        specificity: { a: 1, b: 0, c: 0 },
        key: "#foo",
      },
      {
        type: "class",
        name: "bar",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".bar",
      },
    ],
    specificity: { a: 1, b: 1, c: 0 },
    key: "#foo",
  });
});

test(".parse() parses a compound selector with a type in prefix position", (t) => {
  t.deepEqual(serialize("div.foo"), {
    type: "compound",
    selectors: [
      {
        type: "type",
        name: "div",
        namespace: null,
        specificity: { a: 0, b: 0, c: 1 },
        key: "div",
      },
      {
        type: "class",
        name: "foo",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".foo",
      },
    ],
    specificity: { a: 0, b: 1, c: 1 },
    key: "div",
  });
});

test(".parse() parses an attribute selector when part of a compound selector", (t) => {
  t.deepEqual(serialize(".foo[foo]"), {
    type: "compound",
    selectors: [
      {
        type: "class",
        name: "foo",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".foo",
      },
      {
        type: "attribute",
        name: "foo",
        namespace: null,
        value: null,
        matcher: null,
        modifier: null,
        specificity: { a: 0, b: 1, c: 0 },
      },
    ],
    specificity: { a: 0, b: 2, c: 0 },
    key: ".foo",
  });
});

test(".parse() parses a pseudo-element selector when part of a compound selector", (t) => {
  t.deepEqual(serialize(".foo::before"), {
    type: "compound",
    selectors: [
      {
        type: "class",
        name: "foo",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".foo",
      },
      {
        type: "pseudo-element",
        name: "before",
        specificity: { a: 0, b: 0, c: 1 },
      },
    ],
    specificity: { a: 0, b: 1, c: 1 },
    key: ".foo",
  });
});

test(".parse() parses a pseudo-class selector when part of a compound selector", (t) => {
  t.deepEqual(serialize("div:hover"), {
    type: "compound",
    selectors: [
      {
        type: "type",
        name: "div",
        namespace: null,
        specificity: { a: 0, b: 0, c: 1 },
        key: "div",
      },
      {
        type: "pseudo-class",
        name: "hover",
        specificity: { a: 0, b: 1, c: 0 },
      },
    ],
    specificity: { a: 0, b: 1, c: 1 },
    key: "div",
  });
});
