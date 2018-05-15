import { test } from "@alfa/test";
import { jsx } from "@alfa/jsx";
import { Stage } from "@alfa/css";
import { getStyle } from "../src/get-style";

const span = <span style="font-size: 1.2em; color: inherit" />;
const div = <div style="font-size: 16px; color: red">{span}</div>;

test("Gets the cascaded style of an element", t => {
  const style = getStyle(span, div, Stage.Cascaded);

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
  const style = getStyle(span, div, Stage.Specified);

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
  const style = getStyle(span, div, Stage.Computed);

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

  const style = getStyle(span, div, Stage.Computed);

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

  const style = getStyle(span, span, Stage.Computed);

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

  const style = getStyle(span, div, Stage.Computed);

  t.deepEqual(style, {});
});
