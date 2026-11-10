import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { SelectorEngine } from "../ts/index.ts";

// A representative light-DOM tree:
//
//   <html>
//     <body>
//       <div class="lfr-layout-structure-item foo">
//         <table class="table">
//           <span id="cell">text</span>
//
// This mirrors the shape from the original nesting bug report.
function fixture() {
  const span = h("span", { id: "cell" }, ["text"]);
  const table = h("table", { class: "table" }, [span]);
  const div = h("div", { class: "lfr-layout-structure-item foo" }, [table]);
  const body = h("body", {}, [div]);
  const html = h("html", {}, [body]);
  const document = h.document([html]);
  return { document, html, body, div, table, span };
}

test("serializes a DOM and matches basic selectors", (t) => {
  const { document, html, body, div, table, span } = fixture();

  const engine = SelectorEngine.load();
  engine.loadDom(document);

  const div_ = engine.parseSelector("div");
  t.equal(engine.matches(div_, div), true);
  t.equal(engine.matches(div_, table), false);

  const tableClass = engine.parseSelector(".table");
  t.equal(engine.matches(tableClass, table), true);
  t.equal(engine.matches(tableClass, div), false);

  const id = engine.parseSelector("#cell");
  t.equal(engine.matches(id, span), true);

  const bodyTag = engine.parseSelector("body");
  t.equal(engine.matches(bodyTag, body), true);
  t.equal(engine.matches(bodyTag, html), false);

  engine.clear();
});

test("matches descendant and child combinators across the real tree", (t) => {
  const { document, div, table, span } = fixture();

  const engine = SelectorEngine.load();
  engine.loadDom(document);

  // Descendant: `.foo .table` should match the table nested under the div.
  const descendant = engine.parseSelector(".foo .table");
  t.equal(engine.matches(descendant, table), true);

  // Child: `.foo > .table` should also match (table is a direct child of div).
  const child = engine.parseSelector(".foo > .table");
  t.equal(engine.matches(child, table), true);

  // Child combinator should NOT match a grandchild.
  const grandchild = engine.parseSelector(".foo > span");
  t.equal(engine.matches(grandchild, span), false);

  // But descendant should reach the span.
  const deepDescendant = engine.parseSelector("div span");
  t.equal(engine.matches(deepDescendant, span), true);

  engine.clear();
});

test("matches the desugared form of the nested-rule selector", (t) => {
  const { document, div, table } = fixture();

  const engine = SelectorEngine.load();
  engine.loadDom(document);

  // The original bug: a nested rule
  //   .lfr-layout-structure-item... { & .table { color: rgb(34,34,34) } }
  // desugars to `:is(.lfr-layout-structure-item...) .table`. Verify that the
  // desugared selector matches the table, which is what the cascade needs.
  const desugared = engine.parseSelector(
    ":is(.lfr-layout-structure-item) .table",
  );
  t.notEqual(desugared, -1);
  t.equal(engine.matches(desugared, table), true);
  t.equal(engine.matches(desugared, div), false);

  engine.clear();
});

test("computes specificity for real selectors", (t) => {
  const { document } = fixture();

  const engine = SelectorEngine.load();
  engine.loadDom(document);

  t.deepEqual(engine.specificity(engine.parseSelector("#cell")), [1, 0, 0]);
  t.deepEqual(engine.specificity(engine.parseSelector(".table")), [0, 1, 0]);
  t.deepEqual(engine.specificity(engine.parseSelector("div")), [0, 0, 1]);
  t.deepEqual(
    engine.specificity(engine.parseSelector(".foo .table span")),
    [0, 2, 1],
  );

  engine.clear();
});

test("matches sibling combinators across a list of siblings", (t) => {
  const first = h("li", { class: "first" }, ["a"]);
  const second = h("li", {}, ["b"]);
  const third = h("li", { class: "target" }, ["c"]);
  const list = h("ul", {}, [first, second, third]);
  const document = h.document([h("html", {}, [h("body", {}, [list])])]);

  const engine = SelectorEngine.load();
  engine.loadDom(document);

  // Adjacent sibling: `.first + li` matches only the immediately following li.
  const adjacent = engine.parseSelector(".first + li");
  t.equal(engine.matches(adjacent, second), true);
  t.equal(engine.matches(adjacent, third), false);

  // General sibling: `.first ~ li` matches all following siblings.
  const general = engine.parseSelector(".first ~ li");
  t.equal(engine.matches(general, second), true);
  t.equal(engine.matches(general, third), true);
  t.equal(engine.matches(general, first), false);

  // :nth-child works against the sibling structure.
  const nth = engine.parseSelector("li:nth-child(3)");
  t.equal(engine.matches(nth, third), true);
  t.equal(engine.matches(nth, first), false);

  engine.clear();
});

test("matches :has() against a real tree", (t) => {
  const { document, div, table } = fixture();

  const engine = SelectorEngine.load();
  engine.loadDom(document);

  // The div has a `.table` descendant, so `:has(.table)` should match it.
  const hasTable = engine.parseSelector(".foo:has(.table)");
  t.equal(engine.matches(hasTable, div), true);
  t.equal(engine.matches(hasTable, table), false);

  const hasMissing = engine.parseSelector(".foo:has(.missing)");
  t.equal(engine.matches(hasMissing, div), false);

  // Combined with the desugared nesting form from the original bug report.
  const combined = engine.parseSelector(":is(.lfr-layout-structure-item):has(#cell)");
  t.equal(engine.matches(combined, div), true);

  engine.clear();
});

