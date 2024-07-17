import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import * as predicate from "../../../dist/node/predicate/is-visible.js";

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

  // While <track> elements are not fallback, they are nonetheless invisible

  t.equal(isVisible(track), false);
});

test(`isVisible() returns false when a div element is child of an iframe element`, (t) => {
  const div = <div>hidden</div>;

  const element = <iframe srcdoc="Hello">{div}</iframe>;
  h.document([element]);

  t.equal(isVisible(div), false);
});

test(`isVisible() returns false when an element or text is hidden using the
      \`visibility: hidden\` property`, (t) => {
  const text = h.text("Hello World");
  const element = <div style={{ visibility: "hidden" }}>{text}</div>;

  t.equal(isVisible(element), false);
  t.equal(isVisible(text), false);
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

test(`isVisible() returns false for a text node with a parent element with
      \`opacity: 0\``, (t) => {
  const text = h.text("Hello world");

  const element = <div style={{ opacity: "0" }}>{text}</div>;

  t.equal(isVisible(text), false);
  t.equal(isVisible(element), false);
});

test("isVisible() return true for an empty element with set dimensions", (t) => {
  const element = <div></div>;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          background: "red",
          width: "100px",
          height: "100px",
        }),
      ]),
    ],
  );

  t.equal(isVisible(element), true);
});

test("isVisible() returns false for an empty element whose set dimensions are 0", (t) => {
  const element = <div></div>;

  h.document(
    [element],
    [
      h.sheet([
        h.rule.style("div", {
          background: "red",
          width: "0px",
          height: "0px",
        }),
      ]),
    ],
  );

  t.equal(isVisible(element), false);
});

test("isVisible() returns true for an empty absolutely positioned element stretched within its offset parent", (t) => {
  const element = <div class="stretch"></div>;

  h.document(
    [<div style={{ position: "relative" }}>{element}Hello world</div>],
    [
      h.sheet([
        h.rule.style(".stretch", {
          position: "absolute",
          background: "red",
          top: "0",
          bottom: "0",
          left: "-1px",
          right: "-1px",
        }),
      ]),
    ],
  );

  t.equal(isVisible(element), true);
});

test("isVisible() returns true for an element stretched horizontally and dimensioned vertically", (t) => {
  const element = <div class="stretch"></div>;

  h.document(
    [<div style={{ position: "relative" }}>{element}Hello world</div>],
    [
      h.sheet([
        h.rule.style(".stretch", {
          position: "absolute",
          background: "red",
          height: "100px",
          left: "0",
          right: "-1px",
        }),
      ]),
    ],
  );

  t.equal(isVisible(element), true);
});

test(`isVisible() returns false for text with the same color as their background`, (t) => {
  const text = h.text("Hello");

  h.document(
    [
      <div>
        <span>{text}</span>
      </div>,
    ],
    [
      h.sheet([
        h.rule.style("span", { color: "white" }),
        h.rule.style("div", { background: "white" }),
      ]),
    ],
  );

  t.equal(isVisible(text), false);
});

test(`isVisible() returns true for text with the same color as their background but with other property set`, (t) => {
  const text = h.text("Hello");

  h.document(
    [
      <div>
        <span>{text}</span>
      </div>,
    ],
    [
      h.sheet([
        h.rule.style("span", { color: "white" }),
        h.rule.style("div", { background: "border-box white" }),
      ]),
    ],
  );

  t.equal(isVisible(text), true);
});

test(`isVisible() consider that images' concrete dimensions are the specified ones`, (t) => {
  const img = (
    <img src="foo.jpg" style={{ width: "0px", overflow: "visible" }} />
  );
  const div = (
    <div style={{ width: "0px", overflow: "visible" }}>Hello World</div>
  );

  h.document([img, div]);

  t.equal(isVisible(img), false);
  t.equal(isVisible(div), true);
});
