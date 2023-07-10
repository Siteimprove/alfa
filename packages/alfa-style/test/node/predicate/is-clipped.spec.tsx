import { Device } from "@siteimprove/alfa-device";
import { test } from "@siteimprove/alfa-test";

import * as predicate from "../../../src/node/predicate/is-clipped";

const isClipped = predicate.isClipped(Device.standard());

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
