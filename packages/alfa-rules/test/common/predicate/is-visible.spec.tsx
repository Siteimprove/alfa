import { jsx } from "@siteimprove/alfa-dom/jsx";
import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import * as predicate from "../../../src/common/predicate/is-visible";

const isVisible = predicate.isVisible(Device.standard());

test("isVisible() returns true when an element is visible", (t) => {
  const element = <div>Hello world</div>;

  t.equal(isVisible(element), true);
});

test(`isVisible() returns false when an element is hidden using the \`hidden\`
      attribute`, (t) => {
  const element = <div hidden>Hello World</div>;

  // Attach the element to a document to ensure that the user agent style sheet
  // is applied.
  h.document([element]);

  t.equal(isVisible(element), false);
});

test(`isVisible() returns false when an element is hidden using the
      \`visibility: hidden\` property`, (t) => {
  const element = <div style={{ visibility: "hidden" }}>Hello World</div>;

  t.equal(isVisible(element), false);
});

test(`isVisible() returns false when an element is hidden by reducing its size
      to 0 and clipping overflow`, (t) => {
  const element = (
    <div style={{ width: "0", height: "0", overflow: "hidden" }}>
      Hello World
    </div>
  );

  t.equal(isVisible(element), false);
});

test(`isVisible() returns false when an element is hidden by reducing its size
      to 1x1 pixels and clipping overflow`, (t) => {
  const element = (
    <div style={{ width: "1px", height: "1px", overflow: "hidden" }}>
      Hello World
    </div>
  );

  t.equal(isVisible(element), false);
});

test("isVisible() returns false on empty elements", (t) => {
  const element = <div></div>;

  t.equal(isVisible(element), false);
});

test("isVisible() returns false when no child is visible", (t) => {
  const element = (
    <div>
      <span hidden>Hello</span>{" "}
      <span style={{ visibility: "hidden" }}>World</span>
    </div>
  );

  // Attach the element to a document to ensure that the user agent style sheet
  // is applied.
  h.document([element]);

  t.equal(isVisible(element), false);
});

test("isVisible() returns true when at least one child is visible", (t) => {
  const element = (
    <div>
      <span hidden>Hello</span> <span>World</span>
    </div>
  );

  // Attach the element to a document to ensure that the user agent style sheet
  // is applied.
  h.document([element]);

  t.equal(isVisible(element), true);
});

test("isVisible() returns true for replaced elements with no child", (t) => {
  const element = <img src="foo.jpg" />;

  t.equal(isVisible(element), true);
});

test(`isVisible() returns false for an element that has been pulled offscreen
      by position: absolute and left: 9999px`, (t) => {
  const element = (
    <div
      style={{
        position: "absolute",
        left: "9999px",
      }}
    >
      Hello world
    </div>
  );

  t.equal(isVisible(element), false);
});

test(`isVisible() returns false for an element that has been pulled offscreen
      by position: absolute and left: -9999px`, (t) => {
  const element = (
    <div
      style={{
        position: "absolute",
        left: "-9999px",
      }}
    >
      Hello world
    </div>
  );

  t.equal(isVisible(element), false);
});

test(`isVisible() returns false for an element that has been pulled offscreen
      by position: absolute and right: 9999px`, (t) => {
  const element = (
    <div
      style={{
        position: "absolute",
        right: "9999px",
      }}
    >
      Hello world
    </div>
  );

  t.equal(isVisible(element), false);
});

test(`isVisible() returns false for an element that has been pulled offscreen
      by position: absolute and right: -9999px`, (t) => {
  const element = (
    <div
      style={{
        position: "absolute",
        right: "-9999px",
      }}
    >
      Hello world
    </div>
  );

  t.equal(isVisible(element), false);
});

test("isVisible() returns false for a text node with no data", (t) => {
  const text = h.text("");

  t.equal(isVisible(text), false);
});

test("isVisible() returns false for a text node with only whitespace", (t) => {
  const text = h.text(" ");

  t.equal(isVisible(text), false);
});

test("isVisible() returns false for a text node with a transparent color", (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        color: "transparent",
      }}
    >
      {text}
    </div>
  );

  t.equal(isVisible(text), false);
  t.equal(isVisible(div), false);
});

test("isVisible() returns false for a text node with a font size of 0", (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        fontSize: "0",
      }}
    >
      {text}
    </div>
  );

  t.equal(isVisible(text), false);
  t.equal(isVisible(div), false);
});

test("isVisible() returns true for a text node with a font size of 1px", (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        fontSize: "1px",
      }}
    >
      {text}
    </div>
  );

  t.equal(isVisible(text), true);
  t.equal(isVisible(div), true);
});

test(`isVisible() returns false for a text node with hidden overflow and a 100%
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "100%",
      }}
    >
      {text}
    </div>
  );

  t.equal(isVisible(text), false);
  t.equal(isVisible(div), false);
});

test(`isVisible() returns true for a text node with hidden overflow and a 20%
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "20%",
      }}
    >
      {text}
    </div>
  );

  t.equal(isVisible(text), true);
  t.equal(isVisible(div), true);
});

test(`isVisible() returns false for a text node with hidden overflow and a -100%
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "-100%",
      }}
    >
      {text}
    </div>
  );

  t.equal(isVisible(text), false);
  t.equal(isVisible(div), false);
});

test(`isVisible() returns false for a text node with hidden overflow and a 999px
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "999px",
      }}
    >
      {text}
    </div>
  );

  t.equal(isVisible(text), false);
  t.equal(isVisible(div), false);
});

test(`isVisible() returns true for a text node with hidden overflow and a 20px
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "20px",
      }}
    >
      {text}
    </div>
  );

  t.equal(isVisible(text), true);
  t.equal(isVisible(div), true);
});

test(`isVisible() returns false for a text node with hidden overflow and a -999px
      text indent`, (t) => {
  const text = h.text("Hello world");

  const div = (
    <div
      style={{
        overflow: "hidden",
        whiteSpace: "nowrap",
        textIndent: "-999px",
      }}
    >
      {text}
    </div>
  );

  t.equal(isVisible(text), false);
  t.equal(isVisible(div), false);
});

test("isVisible() returns true for textarea with no child", (t) => {
  const element = <textarea />;

  t.equal(isVisible(element), true);
});
