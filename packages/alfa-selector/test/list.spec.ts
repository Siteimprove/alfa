import { test } from "@siteimprove/alfa-test";

import { Combinator } from "../src";
import { serialize } from "./parser";

test(".parse() parses a list of simple selectors", (t) => {
  t.deepEqual(serialize(".foo, .bar, .baz"), {
    type: "list",
    selectors: [
      { type: "class", name: "foo" },
      { type: "class", name: "bar" },
      { type: "class", name: "baz" },
    ],
  });
});

test(".parse() parses a list of simple and compound selectors", (t) => {
  t.deepEqual(serialize(".foo, #bar.baz"), {
    type: "list",
    selectors: [
      { type: "class", name: "foo" },
      {
        type: "compound",
        left: { type: "id", name: "bar" },
        right: { type: "class", name: "baz" },
      },
    ],
  });
});

test(".parse() parses a list of descendant selectors", (t) => {
  t.deepEqual(serialize("div .foo, span .baz"), {
    type: "list",
    selectors: [
      {
        type: "complex",
        combinator: Combinator.Descendant,
        left: { type: "type", name: "div", namespace: null },
        right: { type: "class", name: "foo" },
      },
      {
        type: "complex",
        combinator: Combinator.Descendant,
        left: { type: "type", name: "span", namespace: null },
        right: { type: "class", name: "baz" },
      },
    ],
  });
});

test(".parse() parses a list of sibling selectors", (t) => {
  t.deepEqual(serialize("div ~ .foo, span ~ .baz"), {
    type: "list",
    selectors: [
      {
        type: "complex",
        combinator: Combinator.Sibling,
        left: { type: "type", name: "div", namespace: null },
        right: { type: "class", name: "foo" },
      },
      {
        type: "complex",
        combinator: Combinator.Sibling,
        left: { type: "type", name: "span", namespace: null },
        right: { type: "class", name: "baz" },
      },
    ],
  });
});

test(".parse() parses a list of selectors with no whitespace", (t) => {
  t.deepEqual(serialize(".foo,.bar"), {
    type: "list",
    selectors: [
      { type: "class", name: "foo" },
      { type: "class", name: "bar" },
    ],
  });
});
