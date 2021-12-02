import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";

import {
  getBackground,
  getForeground,
} from "../../../src/common/expectation/get-colors";
import { Context } from "@siteimprove/alfa-selector";

const device = Device.standard();

test("getBackground() handles opacity correctly", (t) => {
  const target = (
    <span
      style={{ backgroundColor: "#005BBB", color: "white", opacity: "0.4" }}
    >
      Hello
    </span>
  );

  h.document([
    <html>
      <div style={{ backgroundColor: "white" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(
    Iterable.first(getBackground(target, device).get()).get().toJSON(),
    {
      type: "color",
      format: "rgb",
      red: { type: "percentage", value: 0.6 },
      green: { type: "percentage", value: 0.7427451 },
      blue: { type: "percentage", value: 0.8933333 },
      alpha: { type: "percentage", value: 1 },
    }
  );
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

  h.document([
    <html>
      <div style={{ backgroundColor: "red" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(
    Iterable.first(getBackground(target, device).get()).get().toJSON(),
    {
      type: "color",
      format: "rgb",
      red: { type: "percentage", value: 0.75 },
      green: { type: "percentage", value: 0 },
      blue: { type: "percentage", value: 0.25 },
      alpha: { type: "percentage", value: 1 },
    }
  );
});

test("getForeground() handles opacity correctly", (t) => {
  const target = (
    <span
      style={{ backgroundColor: "#005BBB", color: "white", opacity: "0.4" }}
    >
      Hello
    </span>
  );

  h.document([
    <html>
      <div style={{ backgroundColor: "white" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(
    Iterable.first(getForeground(target, device).get()).get().toJSON(),
    {
      type: "color",
      format: "rgb",
      red: { type: "percentage", value: 1 },
      green: { type: "percentage", value: 1 },
      blue: { type: "percentage", value: 1 },
      alpha: { type: "percentage", value: 1 },
    }
  );
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

  h.document([
    <html>
      <div style={{ backgroundColor: "red" }}>{target}</div>
    </html>,
  ]);

  t.deepEqual(
    Iterable.first(getForeground(target, device).get()).get().toJSON(),
    {
      type: "color",
      format: "rgb",
      red: { type: "percentage", value: 0.75 },
      green: { type: "percentage", value: 0.25 },
      blue: { type: "percentage", value: 0.5 },
      alpha: { type: "percentage", value: 1 },
    }
  );
});

test("getForeground() handles hover context", (t) => {
  const target = <a href="#">Link</a>;

  h.document(
    [<html>{target}</html>],
    [
      h.sheet([
        h.rule.style("a:hover", {
          color: "red",
        }),
      ]),
    ]
  );

  t.deepEqual(
    Iterable.first(getForeground(target, device, Context.hover(target)).get())
      .get()
      .toJSON(),
    {
      type: "color",
      format: "rgb",
      red: { type: "percentage", value: 1 },
      green: { type: "percentage", value: 0 },
      blue: { type: "percentage", value: 0 },
      alpha: { type: "percentage", value: 1 },
    }
  );
});

test("getForeground() handles hover context with a mix of opacity and transparency", (t) => {
  const target = <a href="#">Link</a>;

  h.document(
    [
      <html>
        <div style={{ backgroundColor: "red" }}>{target}</div>
      </html>,
    ],
    [
      h.sheet([
        h.rule.style("a:hover", {
          backgroundColor: "blue",
          color: "rgba(255, 255, 255, .5)",
          opacity: "0.5",
        }),
      ]),
    ]
  );

  t.deepEqual(
    Iterable.first(getForeground(target, device, Context.hover(target)).get())
      .get()
      .toJSON(),
    {
      type: "color",
      format: "rgb",
      red: { type: "percentage", value: 0.75 },
      green: { type: "percentage", value: 0.25 },
      blue: { type: "percentage", value: 0.5 },
      alpha: { type: "percentage", value: 1 },
    }
  );
});
