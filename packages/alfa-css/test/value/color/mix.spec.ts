import { test } from "@siteimprove/alfa-test";

import { Mix, MixItem } from "../../../dist/value/color/mix.js";
import { Keyword } from "../../../dist/index.js";

import { parserUnsafe, serializer } from "../../common/parse.js";

const parse = Keyword.parse("foo", "bar", "baz", "qux");

const serializeItem = serializer(MixItem.parse(parse));
const serializeMix = serializer(Mix.parse(parse));

const parseMix = parserUnsafe(Mix.parse(parse));

function keyword<K extends string>(value: K): Keyword.JSON<K> {
  return { type: "keyword", value };
}

test("MixItem.parse() parses a mix item without percentage", (t) => {
  const item = serializeItem("foo");

  t.deepEqual(item, {
    type: "mix-item",
    value: keyword("foo"),
    percentage: null,
  });
});

test("MixItem.parse() parses a mix item with percentage", (t) => {
  const item = serializeItem("foo 30%");

  t.deepEqual(item, {
    type: "mix-item",
    value: keyword("foo"),
    percentage: { type: "percentage", value: 0.3 },
  });
});

test("Mix.parse() parses a mix of items with and without percentages", (t) => {
  const mix = serializeMix("foo 20%, bar, baz 50%");

  t.deepEqual(mix, {
    type: "list",
    values: [
      {
        type: "mix-item",
        value: keyword("foo"),
        percentage: { type: "percentage", value: 0.2 },
      },
      {
        type: "mix-item",
        value: keyword("bar"),
        percentage: null,
      },
      {
        type: "mix-item",
        value: keyword("baz"),
        percentage: { type: "percentage", value: 0.5 },
      },
    ],
    separator: ", ",
  });
});

test("normalize() leaves percentages unchanged when they sum to 100%", (t) => {
  for (const input of [
    "foo 50%, bar 50%",
    "foo 40%, bar 60%",
    "foo 100%",
    "foo 20%, bar 30%, baz 50%",
  ]) {
    const mix = parseMix(input);
    const [normalized, leftover] = Mix.normalize(mix);

    t.deepEqual(normalized.toJSON(), mix.toJSON());
    t.equal(leftover.value, 0);
  }
});

test("normalize() distributes leftover percentage among items without specified percentages", (t) => {
  const mix = parseMix("foo 30%, bar, baz 20%, qux");
  const [normalized, leftover] = Mix.normalize(mix);

  t.deepEqual(normalized.toJSON(), {
    type: "list",
    values: [
      {
        type: "mix-item",
        value: keyword("foo"),
        percentage: { type: "percentage", value: 0.3 },
      },
      {
        type: "mix-item",
        value: keyword("bar"),
        percentage: { type: "percentage", value: 0.25 },
      },
      {
        type: "mix-item",
        value: keyword("baz"),
        percentage: { type: "percentage", value: 0.2 },
      },
      {
        type: "mix-item",
        value: keyword("qux"),
        percentage: { type: "percentage", value: 0.25 },
      },
    ],
    separator: ", ",
  });

  t.equal(leftover.value, 0);
});

test("normalize() assigns negative percentages when specified percentages sum to more than 100%", (t) => {
  const mix = parseMix("foo 80%, bar, baz 50%");
  const [normalized, leftover] = Mix.normalize(mix);

  t.deepEqual(normalized.toJSON(), {
    type: "list",
    values: [
      {
        type: "mix-item",
        value: keyword("foo"),
        percentage: { type: "percentage", value: 0.8 },
      },
      {
        type: "mix-item",
        value: keyword("bar"),
        percentage: { type: "percentage", value: -0.3 },
      },
      {
        type: "mix-item",
        value: keyword("baz"),
        percentage: { type: "percentage", value: 0.5 },
      },
    ],
    separator: ", ",
  });

  t.equal(leftover.value, 0);
});

test("normalize() handles mix with all items missing percentages", (t) => {
  const mix = parseMix("foo, bar, baz, qux");
  const [normalized, leftover] = Mix.normalize(mix);

  t.deepEqual(normalized.toJSON(), {
    type: "list",
    values: [
      {
        type: "mix-item",
        value: keyword("foo"),
        percentage: { type: "percentage", value: 0.25 },
      },
      {
        type: "mix-item",
        value: keyword("bar"),
        percentage: { type: "percentage", value: 0.25 },
      },
      {
        type: "mix-item",
        value: keyword("baz"),
        percentage: { type: "percentage", value: 0.25 },
      },
      {
        type: "mix-item",
        value: keyword("qux"),
        percentage: { type: "percentage", value: 0.25 },
      },
    ],
    separator: ", ",
  });

  t.equal(leftover.value, 0);
});

test("normalize() shrinks specified percentages when they sum to more than 100%", (t) => {
  const mix = parseMix("foo 50%, bar 100%, baz 50%");
  const [normalized, leftover] = Mix.normalize(mix);

  t.deepEqual(normalized.toJSON(), {
    type: "list",
    values: [
      {
        type: "mix-item",
        value: keyword("foo"),
        percentage: { type: "percentage", value: 0.25 },
      },
      {
        type: "mix-item",
        value: keyword("bar"),
        percentage: { type: "percentage", value: 0.5 },
      },
      {
        type: "mix-item",
        value: keyword("baz"),
        percentage: { type: "percentage", value: 0.25 },
      },
    ],
    separator: ", ",
  });

  t.equal(leftover.value, 0);
});

test("normalize() doesn't touch small mixes when not forced", (t) => {
  const mix = parseMix("foo 10%, bar 20%, baz 30%");
  const [normalized, leftover] = Mix.normalize(mix);

  t.deepEqual(normalized.toJSON(), mix.toJSON());
  t.equal(leftover.value, 0.4);
});

test("normalize() expands small mixes when forced", (t) => {
  const mix = parseMix("foo 10%, bar 20%, baz 20%");
  const [normalized, leftover] = Mix.normalize(mix, true);

  t.deepEqual(normalized.toJSON(), {
    type: "list",
    values: [
      {
        type: "mix-item",
        value: keyword("foo"),
        percentage: { type: "percentage", value: 0.2 },
      },
      {
        type: "mix-item",
        value: keyword("bar"),
        percentage: { type: "percentage", value: 0.4 },
      },
      {
        type: "mix-item",
        value: keyword("baz"),
        percentage: { type: "percentage", value: 0.4 },
      },
    ],
    separator: ", ",
  });

  t.equal(leftover.value, 0.5);
});

test("normalize() handles mix with all-0 items", (t) => {
  const mix = parseMix("foo 0%, bar 0%");
  const [normalized, leftover] = Mix.normalize(mix);

  t.deepEqual(normalized.toJSON(), {
    type: "list",
    values: [
      {
        type: "mix-item",
        value: keyword("foo"),
        percentage: { type: "percentage", value: 0 },
      },
      {
        type: "mix-item",
        value: keyword("bar"),
        percentage: { type: "percentage", value: 0 },
      },
    ],
    separator: ", ",
  });

  t.equal(leftover.value, 1);
});

test("normalize() handles mix with all-0 items when forced", (t) => {
  // This tests a division by 0 case when dividing by the total percentage.
  const mix = parseMix("foo 0%, bar 0%");
  const [normalized, leftover] = Mix.normalize(mix, true);

  t.deepEqual(normalized.toJSON(), {
    type: "list",
    values: [
      {
        type: "mix-item",
        value: keyword("foo"),
        percentage: { type: "percentage", value: 0 },
      },
      {
        type: "mix-item",
        value: keyword("bar"),
        percentage: { type: "percentage", value: 0 },
      },
    ],
    separator: ", ",
  });

  t.equal(leftover.value, 1);
});
