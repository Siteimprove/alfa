import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import * as predicate from "../../../dist/node/predicate/is-transparent.js";

const isTransparent = predicate.isTransparent(Device.standard());

test("isTransparent() returns true for element with opacity zero", (t) => {
  const element = <div style={{ opacity: "0" }}>Hello world</div>;

  t.equal(isTransparent(element), true);
});

test("isTransparent() returns false for element with opacity not zero", (t) => {
  const element = <div style={{ opacity: "1" }}>Hello world</div>;

  t.equal(isTransparent(element), false);
});

test("isTransparant() returns true for element with transparent parent", (t) => {
  const span = <span>Hello world</span>;
  const parent = <div style={{ opacity: "0" }}>{span}</div>;

  h.document([parent]);
  t.equal(isTransparent(span), true);
});

test("isTransparent() returns true for text node with parent with alpha zero", (t) => {
  const text = h.text("Hello world");
  const element = <div style={{ color: "rgba(255, 255, 255, 0)" }}>{text}</div>;

  h.document([element]);

  t.equal(isTransparent(text), true);
});

test("isTransparent() returns true for text node with parent with opacity zero", (t) => {
  const text = h.text("Hello world");
  const element = <div style={{ opacity: "0" }}>{text}</div>;

  h.document([element]);

  t.equal(isTransparent(text), true);
});

test("isTransparent() returns false for text node with non-transparent parent", (t) => {
  const text = h.text("Hello world");
  const element = <div>{text}</div>;

  h.document([element]);

  t.equal(isTransparent(text), false);
});
