import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Values } from "@siteimprove/alfa-css";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { None } from "@siteimprove/alfa-option";
import {
  getCascadedStyle,
  getComputedStyle,
  getSpecifiedStyle
} from "../src/get-style";

const { keyword, length, func, number } = Values;

const device = getDefaultDevice();

const span = <span style="font-size: 1.2em; color: inherit" />;
const div = <div style="font-size: 16px; color: red">{span}</div>;

test("Gets the cascaded style of an element", t => {
  const style = getCascadedStyle(span, div, device);

  t.deepEqual(style, {
    color: {
      value: keyword("inherit"),
      source: None
    },
    fontSize: {
      value: length(1.2, "em"),
      source: None
    }
  });
});

test("Gets the specified style of an element", t => {
  const style = getSpecifiedStyle(span, div, device);

  t.deepEqual(style, {
    color: {
      value: func("rgb", [number(255), number(0), number(0)]),
      source: None
    },
    fontSize: {
      value: length(1.2, "em"),
      source: None
    }
  });
});

test("Gets the computed style of an element", t => {
  const style = getComputedStyle(span, div, device);

  t.deepEqual(style, {
    color: {
      value: func("rgb", [number(255), number(0), number(0)]),
      source: None
    },
    fontSize: {
      value: length(19.2, "px"),
      source: None
    }
  });
});

test("Correctly handles default inherited properties", t => {
  const span = <span />;
  const div = <div style="font-size: 14px">{span}</div>;

  const style = getComputedStyle(span, div, device);

  t.deepEqual(style, {
    fontSize: {
      value: length(14, "px"),
      source: None
    }
  });
});

test("Gets the initial values of properties when specified", t => {
  const span = <span style="font-size: initial" />;

  const style = getComputedStyle(span, span, device);

  t.deepEqual(style, {
    fontSize: {
      value: length(16, "px"),
      source: None
    }
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
    color: {
      value: func("rgb", [number(255), number(0), number(0)]),
      source: None
    }
  });
});
