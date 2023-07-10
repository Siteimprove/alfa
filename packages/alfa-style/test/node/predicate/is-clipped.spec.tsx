import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import * as predicate from "../../../src/node/predicate/is-clipped";

const isClipped = predicate.isClipped(Device.standard());

/*********************************************************************
 *
 * Clipping by size, no layout information
 *
 *********************************************************************/

test(`isClipped() returns true when an element is hidden by reducing its size
      to 0 and clipping overflow`, (t) => {
  for (const element of [
    <div style={{ width: "0", overflowX: "hidden" }}>Hello World</div>,

    <div style={{ width: "0", overflowY: "hidden" }}>Hello World</div>,

    <div style={{ height: "0", overflowX: "hidden" }}>Hello World</div>,

    <div style={{ height: "0", overflowY: "hidden" }}>Hello World</div>,

    <div style={{ width: "0", height: "0", overflow: "hidden" }}>
      Hello World
    </div>,
  ]) {
    t.equal(isClipped(element), true);
  }
});

test(`isClipped() returns true when an element is hidden by reducing its size
      to 1x1 pixels and clipping overflow`, (t) => {
  const element = (
    <div style={{ width: "1px", height: "1px", overflow: "hidden" }}>
      Hello World
    </div>
  );

  t.equal(isClipped(element), true);
});

test(`isClipped() returns true when an element scrolls its overflow and its size is reduced to 0 pixel, thus hiding the scrollbar`, (t) => {
  for (const element of [
    <div style={{ width: "0", overflowX: "scroll" }}>Hello World</div>,

    <div style={{ width: "0", overflowY: "scroll" }}>Hello World</div>,

    <div style={{ height: "0", overflowX: "scroll" }}>Hello World</div>,

    <div style={{ height: "0", overflowY: "scroll" }}>Hello World</div>,

    <div style={{ width: "0", height: "0", overflow: "scroll" }}>
      Hello World
    </div>,
  ]) {
    t.equal(isClipped(element), true);
  }
});

test(`isClipped() returns true when an element has its overflow set to auto and its size is reduced to 0 pixel, thus hiding the scrollbar`, (t) => {
  for (const element of [
    <div style={{ width: "0", overflowX: "auto" }}>Hello World</div>,

    <div style={{ width: "0", overflowY: "auto" }}>Hello World</div>,

    <div style={{ height: "0", overflowX: "auto" }}>Hello World</div>,

    <div style={{ height: "0", overflowY: "auto" }}>Hello World</div>,

    <div style={{ width: "0", height: "0", overflow: "auto" }}>
      Hello World
    </div>,
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

  const div = (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "100%",
      }}
    >
      {text}
    </div>
  );

  t.equal(isClipped(text), true);
  t.equal(isClipped(div), true);
});

test(`isClipped() returns false for a text node with hidden overflow and a 20%
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "20%",
      }}
    >
      {text}
    </div>
  );

  t.equal(isClipped(text), false);
  t.equal(isClipped(div), false);
});

test(`isClipped() returns true for a text node with hidden overflow and a -100%
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        textIndent: "-100%",
      }}
    >
      {text}
    </div>
  );

  t.equal(isClipped(text), true);
  t.equal(isClipped(div), true);
});

test(`isClipped() returns true for a text node with hidden overflow and a 999px
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "999px",
      }}
    >
      {text}
    </div>
  );

  t.equal(isClipped(text), true);
  t.equal(isClipped(div), true);
});

test(`isClipped() returns false for a text node with hidden overflow and a 20px
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "20px",
      }}
    >
      {text}
    </div>
  );

  t.equal(isClipped(text), false);
  t.equal(isClipped(div), false);
});

test(`isClipped() returns true for a text node with hidden overflow and a -999px
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        textIndent: "-999px",
      }}
    >
      {text}
    </div>
  );

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
  const element = (
    <div style={{ clip: "rect(1px, 1px, 1px, 1px)" }}>Invisible text</div>
  );

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
    <div style={{ height: "0px", width: "0px", overflow: "hidden" }}>
      {spanSize}
    </div>,
    <div
      style={{ textIndent: "100%", whiteSpace: "nowrap", overflow: "hidden" }}
    >
      {spanIndent}
    </div>,
    <div style={{ clip: "rect(1px, 1px, 1px, 1px)", position: "absolute" }}>
      {spanMask}
    </div>,
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
