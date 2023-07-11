import { Device } from "@siteimprove/alfa-device";
import { Element, h, Text } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import * as predicate from "../../../src/node/predicate/is-clipped";

const isClipped = predicate.isClipped(Device.standard());

function target(
  style: { [prop: string]: string },
  child?: Element | Text
): Element {
  return <div style={style}>{child ?? "Hello World"}</div>;
}

/*********************************************************************
 *
 * Clipping by size, no layout information
 *
 *********************************************************************/

test(`isClipped() returns true when an element is hidden by reducing its size
      to 0 and clipping overflow in the same dimension`, (t) => {
  for (const overflow of ["clip", "hidden"]) {
    for (const element of [
      target({ width: "0", overflowX: overflow }),
      target({ height: "0", overflowY: overflow }),
      target({
        width: "0",
        height: "0",
        overflow,
      }),
    ]) {
      t.equal(isClipped(element), true);
    }
  }
});

test(`isClipped() returns true when an element is hidden by reducing its size
      to 1x1 pixels and clipping overflow`, (t) => {
  for (const overflow of ["clip", "hidden"]) {
    const element = target({ width: "1px", height: "1px", overflow });
    t.equal(isClipped(element), true);
  }
});

test(`isClipped() returns false when an 1×1px element scrolls, thus showing the scrollbar`, (t) => {
  for (const overflow of ["auto", "scroll", "visible"]) {
    const element = target({ width: "1px", height: "1px", overflow });
    t.equal(isClipped(element), false);
  }
});

test(`isClipped() returns true when an element scrolls its overflow and its size is reduced to 0 pixel, thus hiding the scrollbar`, (t) => {
  for (const element of [
    target({ width: "0", overflowX: "scroll" }),
    target({ width: "0", overflowY: "scroll" }),
    target({ height: "0", overflowX: "scroll" }),
    target({ height: "0", overflowY: "scroll" }),
    target({ width: "0", height: "0", overflow: "scroll" }),
  ]) {
    t.equal(isClipped(element), true);
  }
});

test(`isClipped() returns true when an element has its overflow set to auto and its size is reduced to 0 pixel, thus hiding the scrollbar`, (t) => {
  for (const element of [
    target({ width: "0", overflowX: "auto" }),
    target({ width: "0", overflowY: "auto" }),
    target({ height: "0", overflowX: "auto" }),
    target({ height: "0", overflowY: "auto" }),
    target({ width: "0", height: "0", overflow: "auto" }),
  ]) {
    t.equal(isClipped(element), true);
  }
});

/*********************************************************************
 *
 * Clipping by indenting, no layout information
 *
 *********************************************************************/

test(`isClipped() returns true for a text node with hidden overflow and a 100%
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = target(
    { overflow: "hidden", whiteSpace: "nowrap", textIndent: "100%" },
    text
  );

  t.equal(isClipped(text), true);
  t.equal(isClipped(div), true);
});

test(`isClipped() returns false for a text node with hidden overflow and a 20%
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = target(
    { overflow: "hidden", whiteSpace: "nowrap", textIndent: "20%" },
    text
  );

  t.equal(isClipped(text), false);
  t.equal(isClipped(div), false);
});

test(`isClipped() returns true for a text node with hidden overflow and a -100%
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = target({ overflow: "hidden", textIndent: "-100%" }, text);

  t.equal(isClipped(text), true);
  t.equal(isClipped(div), true);
});

test(`isClipped() returns true for a text node with hidden overflow and a 999px
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = target(
    { overflow: "hidden", whiteSpace: "nowrap", textIndent: "999px" },
    text
  );

  t.equal(isClipped(text), true);
  t.equal(isClipped(div), true);
});

test(`isClipped() returns false for a text node with hidden overflow and a 20px
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = target(
    { overflow: "hidden", whiteSpace: "nowrap", textIndent: "20px" },
    text
  );

  t.equal(isClipped(text), false);
  t.equal(isClipped(div), false);
});

test(`isClipped() returns true for a text node with hidden overflow and a -999px
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = target({ overflow: "hidden", textIndent: "-999px" }, text);

  t.equal(isClipped(text), true);
  t.equal(isClipped(div), true);
});

/*********************************************************************
 *
 * Clipping by a clipping shape, no layout information
 *
 *********************************************************************/

test(`isClipped() returns false for a relatively positioned element clipped by
      \`rect(1px, 1px, 1px, 1px)\``, (t) => {
  const element = target({ clip: "rect(1px, 1px, 1px, 1px)" });

  t.equal(isClipped(element), false);
});

/*********************************************************************
 *
 * Checking the recurrence, no layout information
 *
 *********************************************************************/

test(`isClipped() returns true for an element with a fully clipped ancestor`, (t) => {
  const spanSize = <span>Hello World</span>;
  const spanIndent = <span>Hello World</span>;
  const spanMask = <span>Hello World</span>;

  h.document([
    target({ height: "0px", width: "0px", overflow: "hidden" }, spanSize),
    target(
      { textIndent: "100%", whiteSpace: "nowrap", overflow: "hidden" },
      spanIndent
    ),
    target(
      { clip: "rect(1px, 1px, 1px, 1px)", position: "absolute" },
      spanMask
    ),
  ]);

  for (const target of [spanSize, spanIndent, spanMask]) {
    t.equal(isClipped(target), true);
  }
});

test("isClipped() returns false for an absolutely positioned element with a clipping ancestor before its offset parent ", (t) => {
  const element = <div class="absolute">Hello world</div>;

  h.document(
    [
      <div style={{ position: "relative" }}>
        <div class="clip">{element}</div>
      </div>,
    ],
    [
      h.sheet([
        h.rule.style(".absolute", { position: "absolute" }),
        h.rule.style(".clip", {
          overflow: "hidden",
          height: "0px",
          width: "0px",
        }),
      ]),
    ]
  );

  t.equal(isClipped(element), false);
});
