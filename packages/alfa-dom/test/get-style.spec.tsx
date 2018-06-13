import { test } from "@siteimprove/alfa-test";
import { jsx } from "@siteimprove/alfa-jsx";
import {
  getCascadedStyle,
  getSpecifiedStyle,
  getComputedStyle
} from "../src/get-style";

const span = <span style="font-size: 1.2em; color: inherit" />;
const div = <div style="font-size: 16px; color: red">{span}</div>;

test("Gets the cascaded style of an element", t => {
  const style = getCascadedStyle(span, div);

  t.deepEqual(style, {
    color: "inherit",
    fontSize: {
      type: "percentage",
      value: 1.2,
      unit: "em"
    }
  });
});

test("Gets the specified style of an element", t => {
  const style = getSpecifiedStyle(span, div);

  t.deepEqual(style, {
    color: {
      red: 255,
      green: 0,
      blue: 0,
      alpha: 1
    },
    fontSize: {
      type: "percentage",
      value: 1.2,
      unit: "em"
    }
  });
});

test("Gets the computed style of an element", t => {
  const style = getComputedStyle(span, div);

  t.deepEqual(style, {
    color: {
      red: 255,
      green: 0,
      blue: 0,
      alpha: 1
    },
    fontSize: {
      type: "length",
      value: 19.2,
      unit: "px"
    }
  });
});

test("Correctly handles default inherited properties", t => {
  const span = <span />;
  const div = <div style="font-size: 14px">{span}</div>;

  const style = getComputedStyle(span, div);

  t.deepEqual(style, {
    fontSize: {
      type: "length",
      value: 14,
      unit: "px"
    }
  });
});

test("Gets the initial values of properties when specified", t => {
  const span = <span style="font-size: initial" />;

  const style = getComputedStyle(span, span);

  t.deepEqual(style, {
    fontSize: {
      type: "length",
      value: 16,
      unit: "px"
    }
  });
});

test("Gets no properties when none are specified nor inherited", t => {
  const span = <span />;
  const div = <div>{span}</div>;

  const style = getComputedStyle(span, div);

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

  const style = getComputedStyle(span, context);

  t.deepEqual(style, {
    color: {
      red: 255,
      green: 0,
      blue: 0,
      alpha: 1
    }
  });
});
