import { Lexer } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { test } from "@siteimprove/alfa-test";

import { Feature } from "../dist";

const device = Device.standard();

function parse(input: string) {
  return Feature.parseSupportsQuery(Lexer.lex(input)).map(([, query]) => query);
}

// Several examples are taken from
// https://drafts.csswg.org/css-conditional-3/#at-supports

test(".parse() parses a supports query", (t) => {
  t.deepEqual(parse("(display: flex)").getUnsafe().toJSON(), {
    condition: { type: "property", name: "display", value: "flex" },
  });
});

test(".parse() requires parenthesis around property", (t) => {
  t.deepEqual(parse("display: flex").isErr(), true);
});

test(".parse() accepts extra parentheses", (t) => {
  t.deepEqual(parse("((display: flex))").getUnsafe().toJSON(), {
    condition: { type: "property", name: "display", value: "flex" },
  });
});

test(".parse() accepts extra spaces", (t) => {
  t.deepEqual(parse("( display: flex )").getUnsafe().toJSON(), {
    condition: { type: "property", name: "display", value: "flex" },
  });
});

test(".parse() accepts important flag", (t) => {
  t.deepEqual(parse("(display: flex !important)").getUnsafe().toJSON(), {
    condition: { type: "property", name: "display", value: "flex !important" },
  });
});

test(".parse() accepts functional values", (t) => {
  t.deepEqual(parse("(transform: rotate(10deg))").getUnsafe().toJSON(), {
    condition: { type: "property", name: "transform", value: "rotate(10deg)" },
  });
});

test(".parse() parses a negated supports query", (t) => {
  t.deepEqual(parse("not (display: flex)").getUnsafe().toJSON(), {
    condition: {
      type: "not",
      condition: { type: "property", name: "display", value: "flex" },
    },
  });
});

test(".parse() parses a composed query", (t) => {
  t.deepEqual(parse("(foo: bar) and (foo: baz)").getUnsafe().toJSON(), {
    condition: {
      type: "and",
      left: { type: "property", name: "foo", value: "bar" },
      right: { type: "property", name: "foo", value: "baz" },
    },
  });
});

test(".parse() accepts nested and/or", (t) => {
  t.deepEqual(
    parse(
      "((transition: color) or (animation-name: foo)) and (transform: rotate(10deg))",
    )
      .getUnsafe()
      .toJSON(),
    {
      condition: {
        type: "and",
        left: {
          type: "or",
          left: { type: "property", name: "transition", value: "color" },
          right: { type: "property", name: "animation-name", value: "foo" },
        },
        right: { type: "property", name: "transform", value: "rotate(10deg)" },
      },
    },
  );

  t.deepEqual(
    parse(
      "(transition: color) or ((animation-name: foo) and (transform: rotate(10deg)))",
    )
      .getUnsafe()
      .toJSON(),
    {
      condition: {
        type: "or",
        left: { type: "property", name: "transition", value: "color" },
        right: {
          type: "and",
          left: { type: "property", name: "animation-name", value: "foo" },
          right: {
            type: "property",
            name: "transform",
            value: "rotate(10deg)",
          },
        },
      },
    },
  );
});

test(".parse() rejects mixed and/or", (t) => {
  t.deepEqual(
    parse(
      "(transition: color) or (animation-name: foo) and (transform: rotate(10deg))",
    ).isErr(),
    true,
  );
});

test(".match() accepts standard properties", (t) => {
  const query = parse("(foo: bar)").getUnsafe();

  t.deepEqual(query.matches(device), true);
});

test(".match() rejects vendor-prefixed properties", (t) => {
  const query = parse("(-foo: bar)").getUnsafe();

  t.deepEqual(query.matches(device), false);
});
