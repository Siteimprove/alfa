import { Lexer } from "@siteimprove/alfa-css";
import { Selector } from "@siteimprove/alfa-selector";
import { Assertions, test } from "@siteimprove/alfa-test";

import { parse } from "@siteimprove/alfa-selector/test/parser";

import { AncestorFilter, Bucket } from "../src/ancestor-filter";

test("Buckets behave as expected", (t) => {
  const bucket = Bucket.empty();
  t.deepEqual(bucket.toJSON(), []);
  t(!bucket.has("a"));
  t(!bucket.has("b"));

  bucket.add("a");
  t.deepEqual(bucket.toJSON(), [["a", 1]]);
  t(bucket.has("a"));
  t(!bucket.has("b"));

  bucket.add("b");
  t.deepEqual(bucket.toJSON(), [
    ["a", 1],
    ["b", 1],
  ]);
  t(bucket.has("a"));
  t(bucket.has("b"));

  bucket.add("a");
  t.deepEqual(bucket.toJSON(), [
    ["a", 2],
    ["b", 1],
  ]);
  t(bucket.has("a"));
  t(bucket.has("b"));

  bucket.add("a");
  t.deepEqual(bucket.toJSON(), [
    ["a", 3],
    ["b", 1],
  ]);
  t(bucket.has("a"));
  t(bucket.has("b"));

  bucket.remove("a");
  t.deepEqual(bucket.toJSON(), [
    ["a", 2],
    ["b", 1],
  ]);
  t(bucket.has("a"));
  t(bucket.has("b"));

  bucket.remove("a");
  t.deepEqual(bucket.toJSON(), [
    ["a", 1],
    ["b", 1],
  ]);
  t(bucket.has("a"));
  t(bucket.has("b"));

  bucket.remove("b");
  t.deepEqual(bucket.toJSON(), [["a", 1]]);
  t(bucket.has("a"));
  t(!bucket.has("b"));

  bucket.remove("a");
  t.deepEqual(bucket.toJSON(), []);
  t(!bucket.has("a"));
  t(!bucket.has("b"));

  bucket.remove("a");
  t.deepEqual(bucket.toJSON(), []);
  t(!bucket.has("a"));
  t(!bucket.has("b"));
});

const selectors = {
  divSel: parse("div"),
  spanSel: parse("span"),
  dotFooSel: parse(".foo"),
  dotBarSel: parse(".bar"),
  hashFooSel: parse("#foo"),
  hashBarSel: parse("#bar"),
};

function match(
  t: Assertions,
  filter: AncestorFilter,
  expected: AncestorFilter.JSON,
  matching: Array<keyof typeof selectors>,
) {
  t.deepEqual(filter.toJSON(), expected);
  for (const sel of [
    "divSel",
    "spanSel",
    "dotFooSel",
    "dotBarSel",
    "hashFooSel",
    "hashBarSel",
  ] as const) {
    t.equal(filter.matches(selectors[sel]), matching.includes(sel));
  }
}

/**
 * In this test, we are walking the following DOM tree:
 * div
 * +-- div.foo
 * |   +-- div
 * |   |   +-- span#foo
 * |   |   +-- span.foo
 * |   |   +-- span.bar
 * +-- div
 * |   +-- span#bar
 * +-- div.bar
 * |   +-- span.foo
 * |   +-- span.bar
 * span
 *
 * and check the composition of the ancestor filter at each step.
 * Since only element's name, id and class matter (not the actual element), we
 * create them on the fly and remove a structurally identical one rather than the
 * exact one that has been added. This simplifies the test a bit. Actual cascading
 * walks through the actual DOM tree and removes the exact same element when
 * moving up.
 */
test("Ancestor filter behaves as expected", (t) => {
  const filter = AncestorFilter.empty();
  match(t, filter, { ids: [], classes: [], types: [] }, []);

  filter.add(<div></div>);
  match(t, filter, { ids: [], classes: [], types: [["div", 1]] }, ["divSel"]);

  filter.add(<div class="foo"></div>);
  match(t, filter, { ids: [], classes: [["foo", 1]], types: [["div", 2]] }, [
    "divSel",
    "dotFooSel",
  ]);

  filter.add(<div></div>);
  match(t, filter, { ids: [], classes: [["foo", 1]], types: [["div", 3]] }, [
    "divSel",
    "dotFooSel",
  ]);

  filter.add(<span id="foo"></span>);
  match(
    t,
    filter,
    {
      ids: [["foo", 1]],
      classes: [["foo", 1]],
      types: [
        ["div", 3],
        ["span", 1],
      ],
    },
    ["divSel", "dotFooSel", "spanSel", "hashFooSel"],
  );

  filter.remove(<span id="foo"></span>);
  match(t, filter, { ids: [], classes: [["foo", 1]], types: [["div", 3]] }, [
    "divSel",
    "dotFooSel",
  ]);

  filter.add(<span class="foo"></span>);
  match(
    t,
    filter,
    {
      ids: [],
      classes: [["foo", 2]],
      types: [
        ["div", 3],
        ["span", 1],
      ],
    },
    ["divSel", "dotFooSel", "spanSel"],
  );

  filter.remove(<span class="foo"></span>);
  match(t, filter, { ids: [], classes: [["foo", 1]], types: [["div", 3]] }, [
    "divSel",
    "dotFooSel",
  ]);

  filter.add(<span class="bar"></span>);
  match(
    t,
    filter,
    {
      ids: [],
      classes: [
        ["foo", 1],
        ["bar", 1],
      ],
      types: [
        ["div", 3],
        ["span", 1],
      ],
    },
    ["divSel", "dotFooSel", "spanSel", "dotBarSel"],
  );

  filter.remove(<span class="bar"></span>);
  match(t, filter, { ids: [], classes: [["foo", 1]], types: [["div", 3]] }, [
    "divSel",
    "dotFooSel",
  ]);

  filter.remove(<div></div>);
  match(t, filter, { ids: [], classes: [["foo", 1]], types: [["div", 2]] }, [
    "divSel",
    "dotFooSel",
  ]);

  filter.remove(<div class="foo"></div>);
  match(t, filter, { ids: [], classes: [], types: [["div", 1]] }, ["divSel"]);

  filter.add(<div></div>);
  match(t, filter, { ids: [], classes: [], types: [["div", 2]] }, ["divSel"]);

  filter.add(<span id="bar"></span>);
  match(
    t,
    filter,
    {
      ids: [["bar", 1]],
      classes: [],
      types: [
        ["div", 2],
        ["span", 1],
      ],
    },
    ["divSel", "spanSel", "hashBarSel"],
  );

  filter.remove(<span id="bar"></span>);
  match(t, filter, { ids: [], classes: [], types: [["div", 2]] }, ["divSel"]);

  filter.remove(<div></div>);
  match(t, filter, { ids: [], classes: [], types: [["div", 1]] }, ["divSel"]);

  filter.add(<div class="bar"></div>);
  match(t, filter, { ids: [], classes: [["bar", 1]], types: [["div", 2]] }, [
    "divSel",
    "dotBarSel",
  ]);

  filter.add(<span class="foo"></span>);
  match(
    t,
    filter,
    {
      ids: [],
      classes: [
        ["bar", 1],
        ["foo", 1],
      ],
      types: [
        ["div", 2],
        ["span", 1],
      ],
    },
    ["divSel", "dotFooSel", "spanSel", "dotBarSel"],
  );

  filter.remove(<span class="foo"></span>);
  match(t, filter, { ids: [], classes: [["bar", 1]], types: [["div", 2]] }, [
    "divSel",
    "dotBarSel",
  ]);

  filter.add(<span class="bar"></span>);
  match(
    t,
    filter,
    {
      ids: [],
      classes: [["bar", 2]],
      types: [
        ["div", 2],
        ["span", 1],
      ],
    },
    ["divSel", "spanSel", "dotBarSel"],
  );

  filter.remove(<span class="bar"></span>);
  match(t, filter, { ids: [], classes: [["bar", 1]], types: [["div", 2]] }, [
    "divSel",
    "dotBarSel",
  ]);

  filter.remove(<div class="bar"></div>);
  match(t, filter, { ids: [], classes: [], types: [["div", 1]] }, ["divSel"]);

  filter.remove(<div></div>);
  match(t, filter, { ids: [], classes: [], types: [] }, []);

  filter.add(<span></span>);
  match(t, filter, { ids: [], classes: [], types: [["span", 1]] }, ["spanSel"]);

  filter.remove(<span></span>);
  match(t, filter, { ids: [], classes: [], types: [] }, []);
});
