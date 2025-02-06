import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { Sequence } from "@siteimprove/alfa-sequence";
import { test } from "@siteimprove/alfa-test";

import { computePaintingOrder } from "../dist/painting-order.js";

const device = Device.standard();

test("block-level root element is painted before positioned descendant with negative z-index", (t) => {
  const negativeZ = <div style={{ position: "absolute", zIndex: "-1" }}></div>;
  const body = <body>{negativeZ}</body>;

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, negativeZ]).toJSON(),
  );
});

test("block-level stacking context element is painted before positioned descendant with negative z-index", (t) => {
  const negativeZ = <div style={{ position: "absolute", zIndex: "-1" }}></div>;
  const sc = <div style={{ opacity: "0.8" }}>{negativeZ}</div>;
  const body = <body>{sc}</body>;

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, sc, negativeZ]).toJSON(),
  );
});

test("positioned elements with negative z-index are painted in z-order then tree-order", (t) => {
  const negativeZ1 = <div style={{ position: "absolute", zIndex: "-1" }}></div>;
  const negativeZ2 = <div style={{ position: "absolute", zIndex: "-1" }}></div>;
  const negativeZ3 = <div style={{ position: "absolute", zIndex: "-2" }}></div>;
  const body = (
    <body>
      {negativeZ1}
      {negativeZ2}
      {negativeZ3}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, negativeZ3, negativeZ1, negativeZ2]).toJSON(),
  );
});

test("positioned element with negative z-index is painted before block-level element", (t) => {
  const negativeZ = <div style={{ position: "absolute", zIndex: "-1" }}></div>;
  const block = <div></div>;
  const body = (
    <body>
      {block}
      {negativeZ}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, negativeZ, block]).toJSON(),
  );
});

test("block-level descendants are painted in tree-order", (t) => {
  const div3 = <div>3</div>;
  const div2 = <div>2</div>;
  const div1 = <div>{div2}</div>;
  const body = (
    <body>
      {div1}
      {div3}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div1, div2, div3]).toJSON(),
  );
});

test("block-level elements are painted before floating elements", (t) => {
  const div = <div></div>;
  const float = <div style={{ float: "left" }}></div>;
  const body = (
    <body>
      {float}
      {div}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div, float]).toJSON(),
  );
});

test("floating descendants are painted in tree-order", (t) => {
  const div3 = <div style={{ float: "left" }}>3</div>;
  const div2 = <div style={{ float: "right" }}>2</div>;
  const div1 = <div style={{ float: "" }}>{div2}</div>;
  const body = (
    <body>
      {div1}
      {div3}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div1, div2, div3]).toJSON(),
  );
});

test("floating descendants are painted atomically with respect to block-level descendants", (t) => {
  // This means that, even though block-level elements are painted before
  // floating elements in the same stacking context, block-level descendants of
  // floating elements are painted after their floating ancestor and as a
  // consequence will be painted after block-level descendants outside the float
  // even though they appear earlier in tree-order.
  const div2 = <div>2</div>;
  const div1 = <div style={{ float: "left" }}>{div2}</div>;
  const div3 = <div>3</div>;
  const body = (
    <body>
      {div1}
      {div3}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div3, div1, div2]).toJSON(),
  );
});

test("floating descendants are not painted atomically with respect to positioned descendants", (t) => {
  const div1 = <div style={{ position: "absolute" }}>1</div>;
  const div3 = <div style={{ position: "absolute" }}>3</div>;
  const div2 = <div style={{ float: "left" }}>{div3}</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div2, div1, div3]).toJSON(),
  );
});

test("floating descendants are painted before inline-level descendants", (t) => {
  const inline = <div style={{ display: "inline" }}></div>;
  const float = <div style={{ float: "left" }}></div>;
  const body = (
    <body>
      {inline}
      {float}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, float, inline]).toJSON(),
  );
});

test("inline-level descendants are painted in tree-order", (t) => {
  const span3 = <span>3</span>;
  const span2 = <span>2</span>;
  const span1 = <span>{span2}</span>;
  const body = (
    <body>
      {span1}
      {span3}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, span1, span2, span3]).toJSON(),
  );
});

test("inline-level descendants are painted before positioned elements", (t) => {
  const positioned = <div style={{ position: "absolute" }}></div>;
  const inline = <div style={{ display: "inline" }}></div>;
  const body = (
    <body>
      {positioned}
      {inline}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, inline, positioned]).toJSON(),
  );
});

test("positioned descendants with z-index: auto and non-positioned elements that create stacking contexts are painted in tree-order", (t) => {
  const div2 = <div style={{ position: "sticky" }}>2</div>;
  const div1 = <div style={{ position: "fixed" }}>{div2}</div>;
  const div3 = <div style={{ opacity: "0.8" }}>3</div>;
  const div4 = <div style={{ position: "relative" }}>4</div>;
  const body = (
    <body>
      {div1}
      {div3}
      {div4}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div1, div2, div3, div4]).toJSON(),
  );
});

test("positioned descendants are painted atomically with respect to block-level descendants", (t) => {
  // This means that, even though block-level elements are painted before
  // positioned elements in the same stacking context, block-level descendants of
  // positioned elements are painted after their positioned ancestor and as a
  // consequence will be painted after block-level descendants outside the positioned element
  // even though they appear earlier in tree-order.
  const div2 = <div>2</div>;
  const div1 = <div style={{ position: "absolute" }}>{div2}</div>;
  const div3 = <div>3</div>;
  const body = (
    <body>
      {div1}
      {div3}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div3, div1, div2]).toJSON(),
  );
});

test("positioned descendants are not painted atomically with respect to positioned descendants with positive z-indices", (t) => {
  const div1 = <div style={{ position: "absolute", zIndex: "1" }}>1</div>;
  const div3 = <div style={{ position: "absolute", zIndex: "2" }}>3</div>;
  const div2 = <div style={{ position: "absolute" }}>{div3}</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div2, div1, div3]).toJSON(),
  );
});

test("positioned elements without z-index are painted before positioned elements with positve z-index", (t) => {
  const zIndex = <div style={{ position: "absolute", zIndex: "1" }}></div>;
  const positioned = <div style={{ position: "absolute" }}></div>;
  const body = (
    <body>
      {zIndex}
      {positioned}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, positioned, zIndex]).toJSON(),
  );
});

test("positioned elements with positive z-index are painted in z-order then tree-order", (t) => {
  const positiveZ1 = <div style={{ position: "absolute", zIndex: "2" }}></div>;
  const positiveZ2 = <div style={{ position: "absolute", zIndex: "1" }}></div>;
  const positiveZ3 = <div style={{ position: "absolute", zIndex: "1" }}></div>;
  const body = (
    <body>
      {positiveZ1}
      {positiveZ2}
      {positiveZ3}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, positiveZ2, positiveZ3, positiveZ1]).toJSON(),
  );
});

test("inline-level stacking context element is painted after floating descendants and before inline-level descendants", (t) => {
  const float = <div style={{ float: "left" }}></div>;
  const inlineChild = <div style={{ display: "inline" }}></div>;
  const inlineStackingContext = (
    <div style={{ display: "inline", isolation: "isolate" }}>
      {float}
      {inlineChild}
    </div>
  );
  const body = <body>{inlineStackingContext}</body>;

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, float, inlineStackingContext, inlineChild]).toJSON(),
  );
});

test("stacking context creating elements are painted atomically", (t) => {
  // The element with the lower z-index is painted after the element with the
  // higher z-index because the element with opacity creates a stacking context
  // and therefore is painted atomically before the element with z-index: 2.
  const div1 = <div style={{ position: "absolute", zIndex: "2" }}></div>;
  const div3 = <div style={{ position: "relative", zIndex: "10" }}></div>;
  const div2 = <div style={{ opacity: "0.8" }}>{div3}</div>;
  const body = (
    <body>
      {div1}
      {div2}
    </body>
  );

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div2, div3, div1]).toJSON(),
  );
});

test("non-positioned elements are not affected by z-index", (t) => {
  const div2 = <div style={{ zIndex: "1" }}></div>;
  const div3 = <div></div>;
  const div1 = (
    <div>
      {div2}
      {div3}
    </div>
  );
  const body = <body>{div1}</body>;

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div1, div2, div3]).toJSON(),
  );
});

test("flex children are affected by z-index", (t) => {
  const div2 = <div style={{ zIndex: "1" }}></div>;
  const div3 = <div></div>;
  const div1 = (
    <div style={{ display: "flex" }}>
      {div2}
      {div3}
    </div>
  );
  const body = <body>{div1}</body>;

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div1, div3, div2]).toJSON(),
  );
});

test("grid children are affected by z-index", (t) => {
  const div2 = <div style={{ zIndex: "1" }}></div>;
  const div3 = <div></div>;
  const div1 = (
    <div style={{ display: "grid" }}>
      {div2}
      {div3}
    </div>
  );
  const body = <body>{div1}</body>;

  h.document([body]);

  t.deepEqual(
    computePaintingOrder(body, device).toJSON(),
    Sequence.from([body, div1, div3, div2]).toJSON(),
  );
});
