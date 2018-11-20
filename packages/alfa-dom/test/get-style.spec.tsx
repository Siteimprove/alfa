import { Values } from "@siteimprove/alfa-css";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import {
  getCascadedStyle,
  getComputedStyle,
  getSpecifiedStyle
} from "../src/get-style";

const device = getDefaultDevice();

const span = <span style="font-size: 1.2em; color: inherit" />;
const div = <div style="font-size: 16px; color: red">{span}</div>;

test("Gets the cascaded style of an element", t => {
  const style = getCascadedStyle(span, div, device);

  t.deepEqual(style, {
    color: Values.keyword("inherit"),
    fontSize: Values.length(1.2, "em")
  });
});

test("Gets the specified style of an element", t => {
  const style = getSpecifiedStyle(span, div, device);

  t.deepEqual(style, {
    color: Values.color(255, 0, 0, 1),
    fontSize: Values.length(1.2, "em")
  });
});

test("Gets the computed style of an element", t => {
  const style = getComputedStyle(span, div, device);

  t.deepEqual(style, {
    color: Values.color(255, 0, 0, 1),
    fontSize: Values.length(19.2, "px")
  });
});

test("Correctly handles default inherited properties", t => {
  const span = <span />;
  const div = <div style="font-size: 14px">{span}</div>;

  const style = getComputedStyle(span, div, device);

  t.deepEqual(style, {
    fontSize: Values.length(14, "px")
  });
});

test("Gets the initial values of properties when specified", t => {
  const span = <span style="font-size: initial" />;

  const style = getComputedStyle(span, span, device);

  t.deepEqual(style, {
    fontSize: Values.length(16, "px")
  });
});

test("Gets no properties when none are specified nor inherited", t => {
  const span = <span />;
  const div = <div>{span}</div>;

  const style = getComputedStyle(span, div, device);

  t.deepEqual(style, {});
});

test("Correctly handles light DOM inheriting from shadow DOM", t => {
  const span = <span />;

  const context = (
    <div>
      {span}
      <shadow>
        <p style="color: red">
          <slot />
        </p>
      </shadow>
    </div>
  );

  const style = getComputedStyle(span, context, device);

  t.deepEqual(style, {
    color: Values.color(255, 0, 0, 1)
  });
});
