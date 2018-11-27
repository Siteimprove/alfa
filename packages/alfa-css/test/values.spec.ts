import { test } from "@siteimprove/alfa-test";
import { Value, Values, ValueType } from "../src/values";

const foo: Value = {
  type: ValueType.String,
  value: "foo"
};

const bar: Value = {
  type: ValueType.Number,
  value: 42
};

test("Can construct a list", t => {
  t.deepEqual(Values.list(foo, bar), {
    type: ValueType.List,
    value: [foo, bar]
  });
});

test("Can construct a tuple", t => {
  t.deepEqual(Values.tuple(foo, bar), {
    type: ValueType.Tuple,
    value: [foo, bar]
  });
});

test("Can construct a dictionary", t => {
  t.deepEqual(Values.dictionary({ foo, bar }), {
    type: ValueType.Dictionary,
    value: {
      foo,
      bar
    }
  });
});

test("Can construct a keyword", t => {
  t.deepEqual(Values.keyword("foo"), {
    type: ValueType.Keyword,
    value: "foo"
  });
});

test("Returns true when value is a keyword", t => {
  const keyword = Values.keyword("foo");
  t(Values.isKeyword(keyword, "foo"));
  t(!Values.isKeyword(keyword, "bar"));
  t(Values.isKeyword(keyword));
});

test("Can construct a boolean", t => {
  t.deepEqual(Values.boolean(true), {
    type: ValueType.Boolean,
    value: true
  });
});

test("Can construct a string", t => {
  t.deepEqual(Values.string("foo"), {
    type: ValueType.String,
    value: "foo"
  });
});

test("Can construct an integer", t => {
  t.deepEqual(Values.integer(42), {
    type: ValueType.Integer,
    value: 42
  });
});

test("Can construct a number", t => {
  t.deepEqual(Values.number(42.7), {
    type: ValueType.Number,
    value: 42.7
  });
});

test("Can construct a percentage", t => {
  t.deepEqual(Values.percentage(42.7), {
    type: ValueType.Percentage,
    value: 42.7
  });
});

test("Can construct a length", t => {
  t.deepEqual(Values.length(42.7, "cm"), {
    type: ValueType.Length,
    unit: "cm",
    value: 42.7
  });
});

test("Can construct a color", t => {
  t.deepEqual(Values.color(1, 2, 3, 4), {
    type: ValueType.Color,
    value: [1, 2, 3, 4]
  });
});
