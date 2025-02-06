import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { createsStackingContext } from "../../dist/predicate/creates-stacking-context.js";

test("non positioned element with z-index does not create a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ zIndex: "1" }}></div>,
    ),
    false,
  );
});

test("absolutely positioned element without z-index does not create a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ position: "absolute" }}></div>,
    ),
    false,
  );
});

test("relatively positioned element without z-index does not create a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ position: "absolute" }}></div>,
    ),
    false,
  );
});

test("element with opacity equal to 1 does not create a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ opacity: "1" }}></div>,
    ),
    false,
  );
});

test("absolutely positioned element with z-index creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ position: "absolute", zIndex: "1" }}></div>,
    ),
    true,
  );
});

test("relatively positioned element with z-index creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ position: "relative", zIndex: "1" }}></div>,
    ),
    true,
  );
});

test("fixed element creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ position: "fixed" }}></div>,
    ),
    true,
  );
});

test("sticky element creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ position: "sticky" }}></div>,
    ),
    true,
  );
});

test("flex child with z-index creates a stacking context", (t) => {
  const child = <div style={{ zIndex: "1" }}></div>;
  <div style={{ display: "flex" }}>{child}</div>;

  t.equal(createsStackingContext(Device.standard())(child), true);
});

test("grid child with z-index creates a stacking context", (t) => {
  const child = <div style={{ zIndex: "1" }}></div>;
  <div style={{ display: "grid" }}>{child}</div>;

  t.equal(createsStackingContext(Device.standard())(child), true);
});

test("element with opacity less than 1 creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ opacity: "0.9" }}></div>,
    ),
    true,
  );
});

test("element with mix-blend-mode equal to non-initial value creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ mixBlendMode: "multiply" }}></div>,
    ),
    true,
  );
});

test("element with transform equal to non-initial value creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ transform: "translate(10px)" }}></div>,
    ),
    true,
  );
});

test("element with scale equal to non-initial value creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ scale: "90%" }}></div>,
    ),
    true,
  );
});

test("element with rotate equal to non-initial value creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ rotate: "-1deg" }}></div>,
    ),
    true,
  );
});

test("element with translate equal to non-initial value creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ translate: "10px 10px" }}></div>,
    ),
    true,
  );
});

test("element with perspective equal to non-initial value creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ perspective: "800px" }}></div>,
    ),
    true,
  );
});

test("element with clip-path equal to non-initial value creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ clipPath: "circle(70%)" }}></div>,
    ),
    true,
  );
});

test("element with mask equal to non-initial value creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ mask: "url(mask.svg) 0% 0% / 5%" }}></div>,
    ),
    true,
  );
});

test("element with isolation equal to isolate creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ isolation: "isolate" }}></div>,
    ),
    true,
  );
});

test("element with will-change specifying a property that would create a stacking context on non-initial value, creates a stacking context", (t) => {
  for (const prop of [
    "mix-blend-mode",
    "transform",
    "scale",
    "rotate",
    "translate",
    "filter",
    "backdrop-filter",
    "perspective",
    "clip-path",
    "mask",
  ]) {
    t.equal(
      createsStackingContext(Device.standard())(
        <div style={{ willChange: prop }}></div>,
      ),
      true,
    );
  }
});

test("element with contain equal to layout creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ contain: "layout" }}></div>,
    ),
    true,
  );
});

test("element with contain equal to paint creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ contain: "paint" }}></div>,
    ),
    true,
  );
});

test("element with contain equal to strict creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ contain: "strict" }}></div>,
    ),
    true,
  );
});

test("element with contain equal to content creates a stacking context", (t) => {
  t.equal(
    createsStackingContext(Device.standard())(
      <div style={{ contain: "content" }}></div>,
    ),
    true,
  );
});
