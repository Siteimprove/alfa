import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R65, { Outcomes } from "../../src/sia-r65/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";
import { oracle } from "../common/oracle";
import { Map } from "@siteimprove/alfa-map";

const noMatches = Map.empty<string, number>();

test(`evaluate() passes an <a> element that uses the default focus outline`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document([target, <button />]);

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() passes an <a> element that uses a non-default focus outline`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "2px solid blue",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default focus outline and
      is determined to have no other focus indicator`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(
    await evaluate(
      R65,
      { document },
      oracle({
        "has-focus-indicator": false,
      })
    ),
    [
      failed(R65, target, {
        1: Outcomes.HasNoFocusIndicator(noMatches, noMatches),
      }),
      passed(R65, <button />, {
        1: Outcomes.HasFocusIndicator(noMatches, noMatches),
      }),
    ]
  );
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and is determined to have some other focus indicator`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(
    await evaluate(
      R65,
      { document },
      oracle({
        "has-focus-indicator": true,
      })
    ),
    [
      passed(R65, target, {
        1: Outcomes.HasFocusIndicator(noMatches, noMatches),
      }),
      passed(R65, <button />, {
        1: Outcomes.HasFocusIndicator(noMatches, noMatches),
      }),
    ]
  );
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and applies an underline on focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
        }),

        h.rule.style("a:focus", {
          outline: "none",
          textDecoration: "underline",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and whose parent applies an outline when focus is within the parent`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [<div>{target}</div>, <button />],
    [
      h.sheet([
        h.rule.style("div:focus-within", {
          outline: "1px solid blue",
        }),

        h.rule.style("a:focus", {
          outline: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and whose child applies an outline when the <a> element is focused`, async (t) => {
  const target = (
    <a href="#">
      <span>Link</span>
    </a>
  );

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
        }),

        h.rule.style("a:focus span", {
          outline: "1px solid blue",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and applies an outline only when focus should be visible`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
        }),

        h.rule.style("a:focus-visible", {
          outline: "1px solid blue",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() fails an <a> element that removes the default focus outline
      only when focus should be visible and is determined to have no other focus
      indicator`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus-visible", {
          outline: "none",
        }),
      ]),
    ]
  );

  t.deepEqual(
    await evaluate(
      R65,
      { document },
      oracle({
        "has-focus-indicator": false,
      })
    ),
    [
      failed(R65, target, {
        1: Outcomes.HasNoFocusIndicator(noMatches, noMatches),
      }),
      passed(R65, <button />, {
        1: Outcomes.HasFocusIndicator(noMatches, noMatches),
      }),
    ]
  );
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and applies a different color on focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          color: "red",
        }),

        h.rule.style("a:focus", {
          outline: "none",
          textDecoration: "none",
          color: "blue",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and applies a different background color on focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a", {
          textDecoration: "none",
          "background-color": "red",
        }),

        h.rule.style("a:focus", {
          outline: "none",
          textDecoration: "none",
          "background-color": "blue",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and applies a box shadow on focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a", {
          "box-shadow": "none",
        }),

        h.rule.style("a:focus", {
          outline: "none",
          "box-shadow": "10px 5px 5px red",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and applies a border on focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a:focus", {
          outline: "none",
          border: "solid 1px",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() passes an <a> element that removes the default focus outline
      and changes border color on focus`, async (t) => {
  const target = <a href="#">Link</a>;

  const document = h.document(
    [target, <button />],
    [
      h.sheet([
        h.rule.style("a", {
          border: "solid 1px black",
        }),
        h.rule.style("a:focus", {
          outline: "none",
          border: "solid 1px red",
        }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
    passed(R65, <button />, {
      1: Outcomes.HasFocusIndicator(noMatches, noMatches),
    }),
  ]);
});

test(`evaluate() passes an <a> and <button> element which have some focus indicator and includes the matching classes as diagnostics`, async (t) => {
  const target = (
    <a href="#" class="good-focus irrelevant useless">
      Link
    </a>
  );

  const document = h.document([
    target,
    <button class="btn good-focus" />,
    <div class="good-focus irrelevant">
      <p>Content</p>
    </div>,
  ]);

  const matchingTargets = Map.of(
    ["useless", 1],
    ["good-focus", 2],
    ["btn", 1],
    ["irrelevant", 1]
  );

  const matchingNonTargets = Map.of(["good-focus", 1], ["irrelevant", 1]);

  t.deepEqual(await evaluate(R65, { document }), [
    passed(R65, target, {
      1: Outcomes.HasFocusIndicator(matchingTargets, matchingNonTargets),
    }),
    passed(R65, <button class="btn good-focus" />, {
      1: Outcomes.HasFocusIndicator(matchingTargets, matchingNonTargets),
    }),
  ]);
});
