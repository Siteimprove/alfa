import { test, Test } from "@alfa/test";
import { CssTree, parse } from "../src/parser";

async function css(t: Test, input: string, expected: CssTree) {
  t.deepEqual(parse(input), expected, "Parse trees match");
}

test("Can parse a type selector", async t =>
  css(t, "div", {
    type: "type-selector",
    name: "div"
  }));

test("Can parse an uppercase type selector", async t =>
  css(t, "DIV", {
    type: "type-selector",
    name: "div"
  }));

test("Can parse a class selector", async t =>
  css(t, ".foo", {
    type: "class-selector",
    name: "foo"
  }));

test("Can parse an ID selector", async t =>
  css(t, "#foo", {
    type: "id-selector",
    name: "foo"
  }));

test("Can parse a compound selector", async t =>
  css(t, "#foo.bar", {
    type: "compound-selector",
    selectors: [
      {
        type: "id-selector",
        name: "foo"
      },
      {
        type: "class-selector",
        name: "bar"
      }
    ]
  }));

test("Can parse a compound selector with a type in prefix position", async t =>
  css(t, "div.foo", {
    type: "compound-selector",
    selectors: [
      {
        type: "type-selector",
        name: "div"
      },
      {
        type: "class-selector",
        name: "foo"
      }
    ]
  }));

test("Can parse a single descendant selector", async t =>
  css(t, "div .foo", {
    type: "relative-selector",
    combinator: " ",
    selector: {
      type: "class-selector",
      name: "foo"
    },
    relative: {
      type: "type-selector",
      name: "div"
    }
  }));

test("Can parse a single descendant selector with a right-hand type selector", async t =>
  css(t, "div span", {
    type: "relative-selector",
    combinator: " ",
    selector: {
      type: "type-selector",
      name: "span"
    },
    relative: {
      type: "type-selector",
      name: "div"
    }
  }));

test("Can parse a double descendant selector", async t =>
  css(t, "div .foo #bar", {
    type: "relative-selector",
    combinator: " ",
    selector: {
      type: "id-selector",
      name: "bar"
    },
    relative: {
      type: "relative-selector",
      combinator: " ",
      selector: {
        type: "class-selector",
        name: "foo"
      },
      relative: {
        type: "type-selector",
        name: "div"
      }
    }
  }));

test("Can parse a direct descendant selector", async t =>
  css(t, "div > .foo", {
    type: "relative-selector",
    combinator: ">",
    selector: {
      type: "class-selector",
      name: "foo"
    },
    relative: {
      type: "type-selector",
      name: "div"
    }
  }));

test("Can parse a sibling selector", async t =>
  css(t, "div ~ .foo", {
    type: "relative-selector",
    combinator: "~",
    selector: {
      type: "class-selector",
      name: "foo"
    },
    relative: {
      type: "type-selector",
      name: "div"
    }
  }));

test("Can parse a direct sibling selector", async t =>
  css(t, "div + .foo", {
    type: "relative-selector",
    combinator: "+",
    selector: {
      type: "class-selector",
      name: "foo"
    },
    relative: {
      type: "type-selector",
      name: "div"
    }
  }));

test("Can parse a list of simple selectors", async t =>
  css(t, ".foo, .bar, .baz", {
    type: "selector-list",
    selectors: [
      {
        type: "class-selector",
        name: "foo"
      },
      {
        type: "class-selector",
        name: "bar"
      },
      {
        type: "class-selector",
        name: "baz"
      }
    ]
  }));

test("Can parse a list of simple and compound selectors", async t =>
  css(t, ".foo, #bar.baz", {
    type: "selector-list",
    selectors: [
      {
        type: "class-selector",
        name: "foo"
      },
      {
        type: "compound-selector",
        selectors: [
          {
            type: "id-selector",
            name: "bar"
          },
          {
            type: "class-selector",
            name: "baz"
          }
        ]
      }
    ]
  }));

test("Can parse a list of selectors independant of whitespace", async t =>
  css(t, ".foo  ,  .bar  ,  .baz", {
    type: "selector-list",
    selectors: [
      {
        type: "class-selector",
        name: "foo"
      },
      {
        type: "class-selector",
        name: "bar"
      },
      {
        type: "class-selector",
        name: "baz"
      }
    ]
  }));

test("Can parse an attribute selector without a value", async t =>
  css(t, "[foo]", {
    type: "attribute-selector",
    name: "foo",
    value: null,
    matcher: null
  }));

test("Can parse an attribute selector with an ident value", async t =>
  css(t, "[foo=bar]", {
    type: "attribute-selector",
    name: "foo",
    value: "bar",
    matcher: null
  }));

test("Can parse an attribute selector with a string value", async t =>
  css(t, '[foo="bar"]', {
    type: "attribute-selector",
    name: "foo",
    value: "bar",
    matcher: null
  }));
