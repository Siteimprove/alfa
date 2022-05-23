import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { hasTransparentBackground } from "../../../src/element/predicate/has-transparent-background";

const device = Device.standard();

test("hasTransparentBackground() returns false on replaced elements", (t) => {
  const target = <img src="foo.jpg" />;

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), false);
});

test("hasTransparentBackground() returns false on element with a background color", (t) => {
  const target = <div style={{ backgroundColor: "red" }}> Hello</div>;

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), false);
});

test("hasTransparentBackground() returns false on an element with a background image", (t) => {
  const target = (
    <div
      style={{
        backgroundImage:
          "linear-gradient(to right, #046B99 50%, transparent 50%)",
      }}
    >
      Hello
    </div>
  );

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), false);
});

test("hasTransparentBackground() returns false on an element with non-transparent child", (t) => {
  const target = (
    <div>
      <span> First </span>
      <span> Second </span>
      <span style={{ backgroundColor: "#005BBB" }}> Third</span>
    </div>
  );

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), false);
});

test("hasTransparentBackground() returns true on an element whose children all have transparent background", (t) => {
  const target = (
    <div>
      <span> First </span>
      <span> Second </span>
      <span> Third</span>
    </div>
  );

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), true);
});

test("hasTransparentBackground() returns true on elements without background color nor image", (t) => {
  const target = <div> Hello</div>;

  h.document([target]);

  t.deepEqual(hasTransparentBackground(device)(target), true);
});
