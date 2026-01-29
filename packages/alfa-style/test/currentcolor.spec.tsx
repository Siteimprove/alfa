import { test } from "@siteimprove/alfa-test";
import { h } from "@siteimprove/alfa-dom/h";

import { Device } from "@siteimprove/alfa-device";

import { Style } from "../dist/style.js";
import { color } from "./common.js";

const device = Device.standard();

const red = color(1, 0, 0);
const blue = color(0, 0, 1);

/*
 * This file uses `background-color` as a proxy for "properties other than
 * `color`, but whose value is a color". This assumes that all these properties
 * use similar `.compute` and `.use` functions.
 *
 * A more thorough test would iterate over all such properties, or to include
 * similar test cases in the specific test suites of each of them…
 */

test("`currentcolor` is untouched by #computed, resolved by #used (non-`color` property)", (t) => {
  const element = (
    <div style={{ backgroundColor: "currentcolor", color: "red" }} />
  );

  const style = Style.from(element, device);

  t.deepEqual(style.computed("background-color").toJSON(), {
    value: { type: "keyword", value: "currentcolor" },
    source: h.declaration("background-color", "currentcolor").toJSON(),
  });

  t.deepEqual(style.used("background-color").toJSON(), {
    value: red,
    source: h.declaration("background-color", "currentcolor").toJSON(),
  });
});

test("`currentcolor` is untouched by #computed, resolved by #used (`color` property)", (t) => {
  // This test is effectively duplicated from property/color.spec.tsx, for the
  // sake of completeness of `currentcolor` tests.
  const element = <div style={{ color: "currentcolor" }} />;

  <div style={{ color: "red" }}>{element}</div>;

  const style = Style.from(element, device);

  t.deepEqual(style.computed("color").toJSON(), {
    value: { type: "keyword", value: "currentcolor" },
    source: h.declaration("color", "currentcolor").toJSON(),
  });

  t.deepEqual(style.used("color").toJSON(), {
    value: red,
    source: h.declaration("color", "currentcolor").toJSON(),
  });
});

test("#use() find the first defined `color`", (t) => {
  const element = <div style={{ backgroundColor: "currentcolor" }} />;

  <div style={{ color: "red" }}>
    <div>
      <div>{element}</div>
    </div>
  </div>;

  const style = Style.from(element, device);

  t.deepEqual(style.used("background-color").toJSON(), {
    value: red,
    source: h.declaration("background-color", "currentcolor").toJSON(),
  });
});

test("#use() find the first non-`currentcolor` `color`", (t) => {
  const element = (
    <div style={{ backgroundColor: "currentcolor", color: "currentcolor" }} />
  );

  <div style={{ color: "red" }}>
    <div style={{ color: "currentcolor" }}>
      <div style={{ color: "currentcolor" }}>{element}</div>
    </div>
  </div>;

  const style = Style.from(element, device);

  t.deepEqual(style.used("background-color").toJSON(), {
    value: red,
    source: h.declaration("background-color", "currentcolor").toJSON(),
  });
});

test("`currentcolor` is correctly inherited in non-`color` properties", (t) => {
  // background-color is inherited into the inner <div>, but it is inherited as
  // 'currentcolor', not as the resolved "blue", so it resolves to red in the
  // inner <div>.
  const inner = <div style={{ color: "red", backgroundColor: "inherit" }} />;

  const outer = (
    <div style={{ color: "blue", backgroundColor: "currentcolor" }}>
      {inner}
    </div>
  );

  const innerStyle = Style.from(inner, device);
  t.deepEqual(innerStyle.used("background-color").toJSON(), {
    value: red,
    source: h.declaration("background-color", "currentcolor").toJSON(),
  });

  const outerStyle = Style.from(outer, device);
  t.deepEqual(outerStyle.used("background-color").toJSON(), {
    value: blue,
    source: h.declaration("background-color", "currentcolor").toJSON(),
  });
});
