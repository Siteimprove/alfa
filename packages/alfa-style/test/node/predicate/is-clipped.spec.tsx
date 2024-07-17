import { Device } from "@siteimprove/alfa-device";
import type { Element, Text } from "@siteimprove/alfa-dom";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import * as predicate from "../../../dist/node/predicate/is-clipped.js";

const device = Device.standard();
const isClipped = predicate.isClipped(device);

function target(
  style: { [prop: string]: string },
  child?: Element | Text,
): Element {
  return <div style={style}>{child ?? "Hello World"}</div>;
}

function boxed(
  box: { x?: number; y?: number; width: number; height: number },
  style: { [prop: string]: string },
  child?: Element | Text,
): Element {
  return (
    // The actual position of the element doesn't matter.
    <div box={{ device, x: 10, y: 10, ...box }} style={style}>
      {child ?? "Hello World"}
    </div>
  );
}

/*********************************************************************
 *
 * Clipping by size, with layout information
 *
 *********************************************************************/

test(`isClipped() returns true when an element hides overflow and has a 0 size box in the same dimension`, (t) => {
  for (const overflow of ["clip", "hidden"]) {
    for (const element of [
      boxed({ width: 0, height: 100 }, { overflowX: overflow }),
      boxed({ width: 100, height: 0 }, { overflowY: overflow }),
    ]) {
      t.deepEqual(isClipped(element), true);
    }
  }
});

test(`isClipped() returns false when an element overflows its 0 size box`, (t) => {
  for (const element of [
    boxed({ width: 0, height: 100 }, { overflowX: "visible" }),
    boxed({ width: 100, height: 0 }, { overflowY: "visible" }),
  ]) {
    t.deepEqual(isClipped(element), false);
  }
});

test(`isClipped() returns true when an element has no permanent scrollbar,
     hides overflow, and has a 1 size box in the same dimension`, (t) => {
  for (const sameOverflow of ["clip", "hidden"]) {
    for (const crossOverflow of ["auto", "visible"]) {
      for (const element of [
        boxed(
          { width: 1, height: 100 },
          { overflowX: sameOverflow, overflowY: crossOverflow },
        ),
        boxed(
          { width: 100, height: 1 },
          { overflowX: crossOverflow, overflowY: sameOverflow },
        ),
      ]) {
        t.deepEqual(isClipped(element), true);
      }
    }
  }
});

test(`isClipped() returns false when an element has a permanent scrollbar,
     hides overflow, but has a 1 size box in the same dimension`, (t) => {
  for (const overflow of ["clip", "hidden"]) {
    for (const element of [
      boxed(
        { width: 1, height: 100 },
        { overflowX: overflow, overflowY: "scroll" },
      ),
      boxed(
        { width: 100, height: 1 },
        { overflowX: "scroll", overflowY: overflow },
      ),
    ]) {
      t.deepEqual(isClipped(element), false);
    }
  }
});

test(`isClipped() returns false when an element has a 1 size box but creates
      a non-permanent scrollbar in the same dimension`, (t) => {
  for (const element of [
    boxed({ width: 1, height: 100 }, { overflowX: "auto" }),
    boxed({ width: 100, height: 1 }, { overflowY: "auto" }),
  ]) {
    t.deepEqual(isClipped(element), false);
  }
});

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
      target({ width: "0", height: "0", overflow }),
    ]) {
      t.equal(isClipped(element), true);
    }
  }
});

/**
 * @remarks
 * If the cross overflow is set to "hidden" instead, then the (default) "visible"
 * in the same dimension computes to "auto" resulting in a clipped element.
 */
test(`isClipped() returns false when an element is not hidden by reducing its size
      to 0 and clipping overflow in the other dimension but overflowing in the same`, (t) => {
  for (const element of [
    target({ width: "0", overflowY: "clip" }),
    target({ height: "0", overflowX: "clip" }),
  ]) {
    t.equal(isClipped(element), false);
  }
});

test(`isClipped() returns true when an element is hidden by reducing its size
      to 1x1 pixels and clipping overflow`, (t) => {
  for (const overflow of ["clip", "hidden"]) {
    const element = target({ width: "1px", height: "1px", overflow });
    t.equal(isClipped(element), true);
  }
});

test(`isClipped() returns false when an element is reduced to 1px in any dimension, and shows a scrollbar in any dimension`, (t) => {
  for (const element of [
    target({ width: "1px", overflowX: "scroll", overflowY: "clip" }),
    target({ height: "1px", overflowX: "scroll", overflowY: "clip" }),
    target({ width: "1px", overflowX: "clip", overflowY: "scroll" }),
    target({ height: "1px", overflowX: "clip", overflowY: "scroll" }),
  ]) {
    t.deepEqual(isClipped(element), false);
  }
});

test(`isClipped() returns true when an element is reduced to 1px in any dimension, clips in that dimension,
      and does not always show a scrollbar in the cross dimension`, (t) => {
  for (const sameOverflow of ["clip", "hidden"]) {
    for (const crossOverflow of ["auto", "visible"]) {
      for (const element of [
        target({
          width: "1px",
          overflowX: sameOverflow,
          overflowY: crossOverflow,
        }),
        target({
          height: "1px",
          overflowX: crossOverflow,
          overflowY: sameOverflow,
        }),
        target({
          width: "1px",
          overflowX: sameOverflow,
          overflowY: crossOverflow,
        }),
        target({
          height: "1px",
          overflowX: crossOverflow,
          overflowY: sameOverflow,
        }),
      ]) {
        t.deepEqual(isClipped(element), true);
      }
    }
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
    text,
  );

  t.equal(isClipped(text), true);
  t.equal(isClipped(div), true);
});

test(`isClipped() returns false for a text node with hidden overflow and a 20%
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = target(
    { overflow: "hidden", whiteSpace: "nowrap", textIndent: "20%" },
    text,
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
    text,
  );

  t.equal(isClipped(text), true);
  t.equal(isClipped(div), true);
});

test(`isClipped() returns false for a text node with hidden overflow and a 20px
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = target(
    { overflow: "hidden", whiteSpace: "nowrap", textIndent: "20px" },
    text,
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
 * Checking if an element is moved out of a clipping positioning ancestor
 *
 *********************************************************************/

function container(
  style: { [prop: string]: string },
  element: Element,
): Element {
  return boxed({ x: 100, y: 100, width: 10, height: 10 }, style, element);
}

const intersect = () => [
  boxed({ x: 95, y: 95, width: 10, height: 10 }, {}),
  boxed({ x: 105, y: 95, width: 10, height: 10 }, {}),
  boxed({ x: 95, y: 105, width: 10, height: 10 }, {}),
  boxed({ x: 105, y: 105, width: 10, height: 10 }, {}),
];

const aboveLeft = () => boxed({ x: 0, y: 0, width: 10, height: 10 }, {});
const above = () => boxed({ x: 100, y: 0, width: 10, height: 10 }, {});
const aboveRight = () => boxed({ x: 200, y: 0, width: 10, height: 10 }, {});
const right = () => boxed({ x: 200, y: 100, width: 10, height: 10 }, {});
const belowRight = () => boxed({ x: 200, y: 200, width: 10, height: 10 }, {});
const below = () => boxed({ x: 100, y: 200, width: 10, height: 10 }, {});

const belowLeft = () => boxed({ x: 0, y: 200, width: 10, height: 10 }, {});

const left = () => boxed({ x: 0, y: 100, width: 10, height: 10 }, {});

const overflows = ["auto", "clip", "hidden", "scroll", "visible"];
const noVisible = ["auto", "clip", "hidden", "scroll"];
const clipping = ["clip", "hidden"];
const scrolling = ["auto", "scroll"];

test(`isClipped() returns false when an element intersects its ancestor box`, (t) => {
  for (const element of intersect()) {
    for (const overflowX of overflows) {
      for (const overflowY of overflows) {
        const _ = container({ overflowX, overflowY }, element);

        t.deepEqual(isClipped(element), false);
      }
    }
  }
});

test(`isClipped() returns true when an element is left of an horizontally not overflowing ancestor`, (t) => {
  for (const element of [aboveLeft(), left(), belowLeft()]) {
    for (const overflowX of noVisible) {
      for (const overflowY of overflows) {
        const _ = container({ overflowX, overflowY }, element);

        t.deepEqual(isClipped(element), true);
      }
    }
  }
});

test(`isClipped() returns false when an element is left of an ancestor showing horizontal overflow`, (t) => {
  for (const element of [aboveLeft(), left(), belowLeft()]) {
    const _ = container(
      { overflowX: "visible", overflowY: "visible" },
      element,
    );

    t.deepEqual(isClipped(element), false);
  }
});

test(`isClipped() returns false when an element is precisely left of an ancestor showing horizontal overflow`, (t) => {
  // Anything other than clip, visible will turn the overflow-x: visible into auto
  // and clip on the left.
  for (const overflowY of ["clip", "visible"]) {
    const element = left();
    const _ = container({ overflowX: "visible", overflowY }, element);

    t.deepEqual(isClipped(element), false);
  }
});

test(`isClipped() returns true when an element above a vertically not overflowing ancestor`, (t) => {
  for (const element of [aboveLeft(), above(), aboveRight()]) {
    for (const overflowX of overflows) {
      for (const overflowY of noVisible) {
        const _ = container({ overflowX, overflowY }, element);

        t.deepEqual(isClipped(element), true);
      }
    }
  }
});

test(`isClipped() returns false when an element is above an ancestor showing vertical overflow`, (t) => {
  for (const element of [aboveLeft(), above(), aboveRight()]) {
    const _ = container(
      { overflowX: "visible", overflowY: "visible" },
      element,
    );

    t.deepEqual(isClipped(element), false);
  }
});

test(`isClipped() returns false when an element is precisely above an ancestor showing vertical overflow`, (t) => {
  // Anything other than clip, visible will turn the overflow-y: visible into auto
  // and clip on the left.
  for (const overflowX of ["clip", "visible"]) {
    const element = above();
    const _ = container({ overflowX, overflowY: "visible" }, element);

    t.deepEqual(isClipped(element), false);
  }
});

test(`isClipped() returns true when an element is right of an horizontally clipping ancestor`, (t) => {
  for (const element of [aboveRight(), right(), belowRight()]) {
    for (const overflowX of clipping) {
      for (const overflowY of overflows) {
        const _ = container({ overflowX, overflowY }, element);

        t.deepEqual(isClipped(element), true);
      }
    }
  }
});

test(`isClipped() returns false when an element is right of an ancestor showing horizontal overflow or scroll`, (t) => {
  for (const overflowX of ["visible", ...scrolling]) {
    // for aboveRight(), an overflow-x other than visible turns overflow-y into
    // auto, which clips above. The (visible, visible) case is tested with the "above" cases.
    for (const element of [/*aboveRight(),*/ right(), belowRight()]) {
      const _ = container({ overflowX, overflowY: "visible" }, element);

      t.deepEqual(isClipped(element), false);
    }
  }
});

test(`isClipped() returns false when an element is precisely right of an ancestor showing horizontal overflow or scroll`, (t) => {
  for (const overflowX of ["visible", ...scrolling]) {
    for (const overflowY of overflows) {
      const element = right();
      const _ = container({ overflowX, overflowY }, element);

      t.deepEqual(isClipped(element), false);
    }
  }
});

test(`isClipped() returns true when an element is below a vertically clipping ancestor`, (t) => {
  for (const element of [belowLeft(), below(), belowRight()]) {
    for (const overflowX of overflows) {
      for (const overflowY of clipping) {
        const _ = container({ overflowX, overflowY }, element);

        t.deepEqual(isClipped(element), true);
      }
    }
  }
});

test(`isClipped() returns false when an element is below an ancestor showing vertical overflow or scroll`, (t) => {
  for (const overflowY of ["visible", ...scrolling]) {
    // for belowLeft(), an overflow-y other than visible turns overflow-x into
    // auto, which clips left. The (visible, visible) case is tested with the "left" cases.
    for (const element of [/*belowLeft(),*/ below(), belowRight()]) {
      const _ = container({ overflowX: "visible", overflowY }, element);

      t.deepEqual(isClipped(element), false);
    }
  }
});

test(`isClipped() returns false when an element is precisely below an ancestor showing horizontal overflow or scroll`, (t) => {
  for (const overflowY of ["visible", ...scrolling]) {
    for (const overflowX of overflows) {
      const element = below();
      const _ = container({ overflowX, overflowY }, element);

      t.deepEqual(isClipped(element), false);
    }
  }
});

/*********************************************************************
 *
 * Checking the recurrence
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
      spanIndent,
    ),
    target(
      { clip: "rect(1px, 1px, 1px, 1px)", position: "absolute" },
      spanMask,
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
    ],
  );

  t.equal(isClipped(element), false);
});

/**
 * isClippedByMovingAway does its own recurrence when looking for a clipping
 * ancestor.
 */
test(`isClippedByMovingAway() only look at positioning ancestors`, (t) => {
  const element = (
    <div class="absolute" box={{ x: 110, y: 110, width: 20, height: 20 }}>
      Hello world
    </div>
  );

  h.document(
    [
      <div
        style={{ position: "relative" }}
        box={{ x: 100, y: 100, width: 50, height: 50 }}
      >
        <div class="clip" box={{ x: 10, y: 10, width: 10, height: 10 }}>
          {element}
        </div>
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
    ],
  );

  t.equal(isClipped(element), false);
});
