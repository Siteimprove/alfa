import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import * as predicate from "../../../src/common/predicate/is-visible";
import { isRendered } from "../../../src/common/predicate";

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

test(`isVisible() returns false when a text element is child of a video element`, (t) => {
  const text = h.text("This text isn't visible");
  const element = <video src="foo.mp4">{text}</video>;

  h.document([element]);

  t.equal(isVisible(text), false);
});

test(`isVisible() returns false when a track element is a child of video`, (t) => {
  const track = <track kind="description" />;
  const element = <video src="foo.mp4">{track}</video>;

  h.document([element]);

  //<track> element is rendered in the browser, but isn't rendered by our UA.
  // Thus it is not visible and this test returns false

  t.equal(isVisible(track), false);
});

test(`isVisible() returns false when a div element is child of an iframe element`, (t) => {
  const div = <div>hidden</div>;

  const element = (
    <iframe srcdoc="Hello">
      {" "}
      {div}{" "}
    </iframe>
  );
  h.document([div]);

  t.equal(isVisible(div), false);
});

test(`isVisible() returns false when an element is hidden using the
      \`visibility: hidden\` property`, (t) => {
  const element = <div style={{ visibility: "hidden" }}>Hello World</div>;

  t.equal(isVisible(element), false);
});

test(`isVisible() returns false when an element is hidden by reducing its size
      to 0 and clipping overflow`, (t) => {
  for (const element of [
    <div style={{ width: "0", overflowX: "hidden" }}>Hello World</div>,

    <div style={{ width: "0", overflowY: "hidden" }}>Hello World</div>,

    <div style={{ height: "0", overflowX: "hidden" }}>Hello World</div>,

    <div style={{ height: "0", overflowY: "hidden" }}>Hello World</div>,

    <div style={{ width: "0", height: "0", overflow: "hidden" }}>
      Hello World
    </div>,
  ]) {
    t.equal(isVisible(element), false);
  }
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

test(`isVisible() returns false when an element scrolls its overflow and its size is reduced to 0 pixel, thus hiding the scrollbar`, (t) => {
  for (const element of [
    <div style={{ width: "0", overflowX: "scroll" }}>Hello World</div>,

    <div style={{ width: "0", overflowY: "scroll" }}>Hello World</div>,

    <div style={{ height: "0", overflowX: "scroll" }}>Hello World</div>,

    <div style={{ height: "0", overflowY: "scroll" }}>Hello World</div>,

    <div style={{ width: "0", height: "0", overflow: "scroll" }}>
      Hello World
    </div>,
  ]) {
    t.equal(isVisible(element), false);
  }
});

test(`isVisible() returns false when an element has its overflow set to auto and its size is reduced to 0 pixel, thus hidding the scrollbar`, (t) => {
  for (const element of [
    <div style={{ width: "0", overflowX: "auto" }}>Hello World</div>,

    <div style={{ width: "0", overflowY: "auto" }}>Hello World</div>,

    <div style={{ height: "0", overflowX: "auto" }}>Hello World</div>,

    <div style={{ height: "0", overflowY: "auto" }}>Hello World</div>,

    <div style={{ width: "0", height: "0", overflow: "auto" }}>
      Hello World
    </div>,
  ]) {
    t.equal(isVisible(element), false);
  }
});

test("isVisible() returns false on empty elements", (t) => {
  const element = <div />;

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

test(`isVisible() returns false for an absolutely positioned element clipped by
      \`rect(1px, 1px, 1px, 1px)\``, (t) => {
  const element = (
    <div style={{ clip: "rect(1px, 1px, 1px, 1px)", position: "absolute" }}>
      Invisible text
    </div>
  );

  t.equal(isVisible(element), false);
});

test(`isVisible() returns true for a relatively positioned element clipped by
      \`rect(1px, 1px, 1px, 1px)\``, (t) => {
  const element = (
    <div style={{ clip: "rect(1px, 1px, 1px, 1px)" }}>Invisible text</div>
  );

  t.equal(isVisible(element), true);
});

test(`isVisible() returns false for a text node with a parent element with
      \`opacity: 0\``, (t) => {
  const text = h.text("Hello world");

  const element = <div style={{ opacity: "0" }}>{text}</div>;

  t.equal(isVisible(text), false);
  t.equal(isVisible(element), false);
});

test(`isVisible() returns false for an element with a fully clipped ancestor`, (t) => {
  const spanSize = <span>Hello World</span>;
  const spanIndent = <span>Hello World</span>;
  const spanMask = <span>Hello World</span>;

  h.document([
    <div style={{ height: "0px", width: "0px", overflow: "hidden" }}>
      {spanSize}
    </div>,
    <div
      style={{ textIndent: "100%", whiteSpace: "nowrap", overflow: "hidden" }}
    >
      {spanIndent}
    </div>,
    <div style={{ clip: "rect(1px, 1px, 1px, 1px)", position: "absolute" }}>
      {spanMask}
    </div>,
  ]);

  for (const target of [spanSize, spanIndent, spanMask]) {
    t.equal(isVisible(target), false);
  }
});
