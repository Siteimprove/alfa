import { test } from "@siteimprove/alfa-test";

import { Combinator } from "../dist/index.js";
import { List, Selector } from "../src/index.js";
import type { Selector as BaseType } from "../src/selector/selector.js";
import { parseErr, serialize as baseSerialize } from "./parser.js";

const serialize = (
  input: string,
  options: BaseType.Options = { forgiving: false, relative: false },
) => baseSerialize(input, List.parseComplex(Selector.parseSelector, options));

test(".parseComplex() parses a list of simple selectors", (t) => {
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

test(".parseComplex() simplifies a list with a single selector", (t) => {
  t.deepEqual(serialize(".foo"), {
    type: "class",
    name: "foo",
    specificity: { a: 0, b: 1, c: 0 },
    key: ".foo",
  });
});

test(".parseComplex() refuses to parse an empty list", (t) => {
  t(parseErr("", List.parseComplex(Selector.parseSelector)).isErr());
});

test(".parseComplex() parses a list of simple and compound selectors", (t) => {
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

test(".parseComplex() parses a list of descendant selectors", (t) => {
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

test(".parseComplex() parses a list of sibling selectors", (t) => {
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

test(".parseComplex() parses a list of selectors with no whitespace", (t) => {
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

test(".parseComplex() refuses to parse a list with invalid selectors by default", (t) => {
  const parser = (input: string) =>
    parseErr(input, List.parseComplex(Selector.parseSelector));

  t(parser("div, ###").isErr());
  t(parser("###, div").isErr());
  t(parser("###").isErr());
});

test(".parseComplex() can parse a list with invalid selectors when forgiving", (t) => {
  t.deepEqual(serialize("div, ###, span", { forgiving: true }), {
    type: "list",
    selectors: [
      {
        type: "type",
        name: "div",
        namespace: null,
        specificity: { a: 0, b: 0, c: 1 },
        key: "div",
      },
      {
        type: "type",
        name: "span",
        namespace: null,
        specificity: { a: 0, b: 0, c: 1 },
        key: "span",
      },
    ],
    specificity: { a: 0, b: 0, c: 1 },
  });
});

test(".parseComplex() simplifies a forgiving list with a single valid selector", (t) => {
  t.deepEqual(serialize("###, .foo, $$$", { forgiving: true }), {
    type: "class",
    name: "foo",
    specificity: { a: 0, b: 1, c: 0 },
    key: ".foo",
  });
});

test(".parseComplex() accepts forgiving lists that are entirely invalid", (t) => {
  t.deepEqual(serialize("###, $$$", { forgiving: true }), {
    type: "list",
    selectors: [],
    specificity: { a: 0, b: 0, c: 0 },
  });

  t.deepEqual(serialize("", { forgiving: true }), {
    type: "list",
    selectors: [],
    specificity: { a: 0, b: 0, c: 0 },
  });
});
