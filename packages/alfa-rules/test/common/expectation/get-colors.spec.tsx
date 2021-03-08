import { Document } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Iterable } from "@siteimprove/alfa-iterable";
import { test } from "@siteimprove/alfa-test";

import {
  getBackground,
  getForeground,
} from "../../../src/common/expectation/get-colors";

test("getBackground() handles opacity correctly", (t) => {
  const target = (
    <span
      style={{ backgroundColor: "#005BBB", color: "white", opacity: "0.4" }}
    >
      Hello
    </span>
  );
  const document = Document.of([
    <html>
      <div style={{ backgroundColor: "white" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(Iterable.first(getBackground(target).get()).get().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 0.6 },
    green: { type: "percentage", value: 0.7427451 },
    blue: { type: "percentage", value: 0.8933333 },
    alpha: { type: "percentage", value: 1 },
  });
});

test("getBackground() handles mix of opacity and transparency", (t) => {
  const target = (
    <span
      style={{
        backgroundColor: "rgba(0, 0, 255, .5)",
        color: "white",
        opacity: "0.5",
      }}
    >
      Hello
    </span>
  );
  const document = Document.of([
    <html>
      <div style={{ backgroundColor: "red" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(Iterable.first(getBackground(target).get()).get().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 0.75 },
    green: { type: "percentage", value: 0 },
    blue: { type: "percentage", value: 0.25 },
    alpha: { type: "percentage", value: 1 },
  });
});
test("getForeground() handles opacity correctly", (t) => {
  const target = (
    <span
      style={{ backgroundColor: "#005BBB", color: "white", opacity: "0.4" }}
    >
      Hello
    </span>
  );
  const document = Document.of([
    <html>
      <div style={{ backgroundColor: "white" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(Iterable.first(getForeground(target).get()).get().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 1 },
    green: { type: "percentage", value: 1 },
    blue: { type: "percentage", value: 1 },
    alpha: { type: "percentage", value: 1 },
  });
});

test("getForeground() handles mix of opacity and transparency", (t) => {
  const target = (
    <span
      style={{
        backgroundColor: "blue",
        color: "rgba(255, 255, 255, .5)",
        opacity: "0.5",
      }}
    >
      Hello
    </span>
  );
  const document = Document.of([
    <html>
      <div style={{ backgroundColor: "red" }}>{target}</div>
    </html>,
  ]);

  // const foo = Iterable.first(getForeground(target).get()).get().toJSON();

  t.deepEqual(Iterable.first(getForeground(target).get()).get().toJSON(), {
    type: "color",
    format: "rgb",
    red: { type: "percentage", value: 0.75 },
    green: { type: "percentage", value: 0.25 },
    blue: { type: "percentage", value: 0.5 },
    alpha: { type: "percentage", value: 1 },
  });
});
