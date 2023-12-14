import { test } from "@siteimprove/alfa-test";

import { Combinator } from "../src";
import { serialize } from "./parser";

test(".parse() parses a list of simple selectors", (t) => {
  t.deepEqual(serialize(".foo, .bar, .baz"), {
    type: "list",
    selectors: [
      {
        type: "class",
        name: "foo",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".foo",
      },
      {
        type: "class",
        name: "bar",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".bar",
      },
      {
        type: "class",
        name: "baz",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".baz",
      },
    ],
    specificity: { a: 0, b: 1, c: 0 },
  });
});

test(".parse() parses a list of simple and compound selectors", (t) => {
  t.deepEqual(serialize(".foo, #bar.baz"), {
    type: "list",
    selectors: [
      {
        type: "class",
        name: "foo",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".foo",
      },
      {
        type: "compound",
        selectors: [
          {
            type: "id",
            name: "bar",
            specificity: { a: 1, b: 0, c: 0 },
            key: "#bar",
          },
          {
            type: "class",
            name: "baz",
            specificity: { a: 0, b: 1, c: 0 },
            key: ".baz",
          },
        ],
        specificity: { a: 1, b: 1, c: 0 },
        key: "#bar",
      },
    ],
    specificity: { a: 1, b: 1, c: 0 },
  });
});

test(".parse() parses a list of descendant selectors", (t) => {
  t.deepEqual(serialize("div .foo, span .baz"), {
    type: "list",
    selectors: [
      {
        type: "complex",
        combinator: Combinator.Descendant,
        left: {
          type: "type",
          name: "div",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "div",
        },
        right: {
          type: "class",
          name: "foo",
          specificity: { a: 0, b: 1, c: 0 },
          key: ".foo",
        },
        specificity: { a: 0, b: 1, c: 1 },
        key: ".foo",
      },
      {
        type: "complex",
        combinator: Combinator.Descendant,
        left: {
          type: "type",
          name: "span",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "span",
        },
        right: {
          type: "class",
          name: "baz",
          specificity: { a: 0, b: 1, c: 0 },
          key: ".baz",
        },
        specificity: { a: 0, b: 1, c: 1 },
        key: ".baz",
      },
    ],
    specificity: { a: 0, b: 1, c: 1 },
  });
});

test(".parse() parses a list of sibling selectors", (t) => {
  t.deepEqual(serialize("div ~ .foo, span ~ .baz"), {
    type: "list",
    selectors: [
      {
        type: "complex",
        combinator: Combinator.Sibling,
        left: {
          type: "type",
          name: "div",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "div",
        },
        right: {
          type: "class",
          name: "foo",
          specificity: { a: 0, b: 1, c: 0 },
          key: ".foo",
        },
        specificity: { a: 0, b: 1, c: 1 },
        key: ".foo",
      },
      {
        type: "complex",
        combinator: Combinator.Sibling,
        left: {
          type: "type",
          name: "span",
          namespace: null,
          specificity: { a: 0, b: 0, c: 1 },
          key: "span",
        },
        right: {
          type: "class",
          name: "baz",
          specificity: { a: 0, b: 1, c: 0 },
          key: ".baz",
        },
        specificity: { a: 0, b: 1, c: 1 },
        key: ".baz",
      },
    ],
    specificity: { a: 0, b: 1, c: 1 },
  });
});

test(".parse() parses a list of selectors with no whitespace", (t) => {
  t.deepEqual(serialize(".foo,.bar"), {
    type: "list",
    selectors: [
      {
        type: "class",
        name: "foo",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".foo",
      },
      {
        type: "class",
        name: "bar",
        specificity: { a: 0, b: 1, c: 0 },
        key: ".bar",
      },
    ],
    specificity: { a: 0, b: 1, c: 0 },
  });
});
