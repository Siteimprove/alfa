import { h } from "@siteimprove/alfa-dom";
import { test, type Assertions } from "@siteimprove/alfa-test";

import { Array } from "@siteimprove/alfa-array";
import { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import { Serializable } from "@siteimprove/alfa-json";

import { PaintingOrder } from "../dist/painting-order.js";

const device = Device.standard();
const options = { verbosity: Serializable.Verbosity.Low };

function testOrder(t: Assertions, root: Element, expected: Array<Element>) {
  t.deepEqual(PaintingOrder.from(h.document([root]), device).toJSON(options), {
    type: "painting-order",
    elements: Array.toJSON(expected, options),
  });
}

test("block-level element is painted before positioned descendant with negative z-index", (t) => {
  const div = <div style={{ position: "absolute", zIndex: "-1" }}>Hello</div>;
  const body = <body>{div}</body>;

  testOrder(t, body, [body, div]);
});

test("block-level stacking context element is painted before positioned descendant with negative z-index", (t) => {
  const div2 = <div style={{ position: "absolute", zIndex: "-1" }}>Hello</div>;
  const div1 = <div style={{ opacity: "0.8" }}>{div2}</div>;
  const body = <body>{div1}</body>;

  testOrder(t, body, [body, div1, div2]);
});

test("positioned elements with negative z-index are painted in z-order then tree-order", (t) => {
  const div1 = <div style={{ position: "absolute", zIndex: "-1" }}>Hello</div>;
  const div2 = <div style={{ position: "absolute", zIndex: "-1" }}>World</div>;
  const div3 = <div style={{ position: "absolute", zIndex: "-2" }}>!</div>;
  const body = (
    <body>
      {div1}
      {div2}
      {div3}
    </body>
  );

  testOrder(t, body, [body, div3, div1, div2]);
});

test("positioned element with negative z-index is painted before block-level element", (t) => {
  const div2 = <div style={{ position: "absolute", zIndex: "-1" }}>Hello</div>;
  const div1 = <div>World</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  testOrder(t, body, [body, div2, div1]);
});

test("block-level descendants are painted in tree-order", (t) => {
  const div3 = <div>Hello</div>;
  const div2 = <div>World</div>;
  const div1 = <div>{div2}</div>;
  const body = (
    <body>
      {div1}
      {div3}
    </body>
  );

  testOrder(t, body, [body, div1, div2, div3]);
});

test("block-level elements are painted before floating elements", (t) => {
  const div2 = <div>Hello</div>;
  const div1 = <div style={{ float: "left" }}>World</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  testOrder(t, body, [body, div2, div1]);
});

test("floating descendants are painted in tree-order", (t) => {
  const div3 = <div style={{ float: "left" }}>Hello</div>;
  const div2 = <div style={{ float: "right" }}>World</div>;
  const div1 = <div style={{ float: "" }}>{div2}</div>;
  const body = (
    <body>
      {div1}
      {div3}
    </body>
  );

  testOrder(t, body, [body, div1, div2, div3]);
});

test("floating descendants are painted atomically with respect to block-level descendants", (t) => {
  // This means that, even though block-level elements are painted before
  // floating elements in the same stacking context, block-level descendants of
  // floating elements are painted after their floating ancestor and as a
  // consequence will be painted after block-level descendants outside the float
  // even though they appear earlier in tree-order.
  const div2 = <div>Hello</div>;
  const div1 = <div style={{ float: "left" }}>{div2}</div>;
  const div3 = <div>World</div>;
  const body = (
    <body>
      {div1}
      {div3}
    </body>
  );

  testOrder(t, body, [body, div3, div1, div2]);
});

test("floating descendants are not painted atomically with respect to positioned descendants", (t) => {
  const div1 = <div style={{ position: "absolute" }}>Hello</div>;
  const div3 = <div style={{ position: "absolute" }}>World</div>;
  const div2 = <div style={{ float: "left" }}>{div3}</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  testOrder(t, body, [body, div2, div1, div3]);
});

test("floating descendants are painted before inline-level descendants", (t) => {
  const div1 = <div style={{ display: "inline" }}>Hello</div>;
  const div2 = <div style={{ float: "left" }}>World</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  testOrder(t, body, [body, div2, div1]);
});

test("inline-level descendants are painted in tree-order", (t) => {
  const span3 = <span>Hello</span>;
  const span2 = <span>World</span>;
  const span1 = <span>{span2}</span>;
  const body = (
    <body>
      {span1}
      {span3}
    </body>
  );

  testOrder(t, body, [body, span1, span2, span3]);
});

test("inline-level descendants are painted before positioned elements", (t) => {
  const div1 = <div style={{ position: "absolute" }}>Hello</div>;
  const div2 = <div style={{ display: "inline" }}>World</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  testOrder(t, body, [body, div2, div1]);
});

test("positioned descendants with z-index: auto and non-positioned elements that create stacking contexts are painted in tree-order", (t) => {
  const div2 = <div style={{ position: "sticky" }}>Hello</div>;
  const div1 = <div style={{ position: "fixed" }}>{div2}</div>;
  const div3 = <div style={{ opacity: "0.8" }}>World</div>;
  const div4 = <div style={{ position: "relative" }}>!</div>;
  const body = (
    <body>
      {div1}
      {div3}
      {div4}
    </body>
  );

  testOrder(t, body, [body, div1, div2, div3, div4]);
});

test("positioned descendants are painted atomically with respect to block-level descendants", (t) => {
  // This means that, even though block-level elements are painted before
  // positioned elements in the same stacking context, block-level descendants of
  // positioned elements are painted after their positioned ancestor and as a
  // consequence will be painted after block-level descendants outside the positioned element
  // even though they appear earlier in tree-order.
  const div2 = <div>Hello</div>;
  const div1 = <div style={{ position: "absolute" }}>{div2}</div>;
  const div3 = <div>World</div>;
  const body = (
    <body>
      {div1}
      {div3}
    </body>
  );

  testOrder(t, body, [body, div3, div1, div2]);
});

test("positioned descendants are not painted atomically with respect to positioned descendants with positive z-indices", (t) => {
  const div1 = <div style={{ position: "absolute", zIndex: "1" }}>Hello</div>;
  const div3 = <div style={{ position: "absolute", zIndex: "2" }}>World</div>;
  const div2 = <div style={{ position: "absolute" }}>{div3}</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  testOrder(t, body, [body, div2, div1, div3]);
});

test("positioned elements without z-index are painted before positioned elements with positve z-index", (t) => {
  const div1 = <div style={{ position: "absolute", zIndex: "1" }}>Hello</div>;
  const div2 = <div style={{ position: "absolute" }}>World</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  testOrder(t, body, [body, div2, div1]);
});

test("positioned elements with positive z-index are painted in z-order then tree-order", (t) => {
  const div1 = <div style={{ position: "absolute", zIndex: "2" }}>Hello</div>;
  const div2 = <div style={{ position: "absolute", zIndex: "1" }}>World</div>;
  const div3 = <div style={{ position: "absolute", zIndex: "1" }}>!</div>;
  const body = (
    <body>
      {div1}
      {div2}
      {div3}
    </body>
  );

  testOrder(t, body, [body, div2, div3, div1]);
});

test("inline-level stacking context element is painted after floating descendants and before inline-level descendants", (t) => {
  const div2 = <div style={{ float: "left" }}>Hello</div>;
  const div3 = <div style={{ display: "inline" }}>World</div>;
  const div1 = (
    <div style={{ display: "inline", isolation: "isolate" }}>
      {div2}
      {div3}
    </div>
  );
  const body = <body>{div1}</body>;

  testOrder(t, body, [body, div2, div1, div3]);
});

test("stacking context creating elements are painted atomically", (t) => {
  // The element with the lower z-index is painted after the element with the
  // higher z-index because the element with opacity creates a stacking context
  // and therefore is painted atomically before the element with z-index: 2.
  const div1 = <div style={{ position: "absolute", zIndex: "2" }}>Hello</div>;
  const div3 = <div style={{ position: "relative", zIndex: "10" }}>World</div>;
  const div2 = <div style={{ opacity: "0.8" }}>{div3}</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  testOrder(t, body, [body, div2, div3, div1]);
});

test("non-positioned elements are not affected by z-index", (t) => {
  const div2 = <div style={{ zIndex: "1" }}>Hello</div>;
  const div3 = <div>World</div>;
  const div1 = (
    <div>
      {div2}
      {div3}
    </div>
  );
  const body = <body>{div1}</body>;

  testOrder(t, body, [body, div1, div2, div3]);
});

test("flex children are affected by z-index", (t) => {
  const div2 = <div style={{ zIndex: "1" }}>Hello</div>;
  const div3 = <div>World</div>;
  const div1 = (
    <div style={{ display: "flex" }}>
      {div2}
      {div3}
    </div>
  );
  const body = <body>{div1}</body>;

  testOrder(t, body, [body, div1, div3, div2]);
});

test("grid children are affected by z-index", (t) => {
  const div2 = <div style={{ zIndex: "1" }}>Hello</div>;
  const div3 = <div>World</div>;
  const div1 = (
    <div style={{ display: "grid" }}>
      {div2}
      {div3}
    </div>
  );
  const body = <body>{div1}</body>;

  testOrder(t, body, [body, div1, div3, div2]);
});

test("invisible elements are not painted", (t) => {
  const body = (
    <body>
      <div></div>
      <div style={{ visibility: "hidden" }}></div>
      <div style={{ display: "none" }}></div>
    </body>
  );

  testOrder(t, body, [body]);
});

test("block-level element is painted after inline-level parent", (t) => {
  const div = <div>Hello</div>;
  const span = <span>{div}</span>;

  testOrder(t, span, [span, div]);
});
