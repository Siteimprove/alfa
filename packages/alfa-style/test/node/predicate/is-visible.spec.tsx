import { Element } from "@siteimprove/alfa-dom";
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

  t(!isVisible(element));
});

test(`isVisible() returns false when a text element is child of a video element`, (t) => {
  const text = h.text("This text isn't visible");
  const element = <video src="foo.mp4">{text}</video>;

  h.document([element]);

  t(!isVisible(text));
});

test(`isVisible() returns false when a track element is a child of video`, (t) => {
  const track = <track kind="descriptions" />;
  const element = <video src="foo.mp4">{track}</video>;

  h.document([element]);

  // While <track> elements are not fallback, they are nonetheless invisible

  t(!isVisible(track));
});

test(`isVisible() returns false when a div element is child of an iframe element`, (t) => {
  const div = <div>hidden</div>;

  const element = <iframe srcdoc="Hello">{div}</iframe>;
  h.document([element]);

  t(!isVisible(div));
});

test(`isVisible() returns false when an element or text is hidden using the
      \`visibility: hidden\` property`, (t) => {
  const text = h.text("Hello World");
  const element = <div style={{ visibility: "hidden" }}>{text}</div>;

  t(!isVisible(element));
  t(!isVisible(text));
});

test("isVisible() returns false on empty elements", (t) => {
  const element = <div />;

  t(!isVisible(element));
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

  t(!isVisible(element));
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

  t(isVisible(element));
});

test("isVisible() returns true for replaced elements with no child", (t) => {
  const element = <img src="foo.jpg" />;

  t(isVisible(element));
});

test("isVisible() returns false for a text node with no data", (t) => {
  const text = h.text("");

  t(!isVisible(text));
});

test("isVisible() returns false for a text node with only whitespace", (t) => {
  const text = h.text(" ");

  t(!isVisible(text));
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

  t(!isVisible(text));
  t(!isVisible(div));
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

  t(!isVisible(text));
  t(!isVisible(div));
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

  t(isVisible(text));
  t(isVisible(div));
});

test("isVisible() returns true for textarea with no child", (t) => {
  const element = <textarea />;

  t(isVisible(element));
});

test(`isVisible() returns false for an absolutely positioned element clipped by
      \`rect(1px, 1px, 1px, 1px)\``, (t) => {
  const element = (
    <div style={{ clip: "rect(1px, 1px, 1px, 1px)", position: "absolute" }}>
      Invisible text
    </div>
  );

  t(!isVisible(element));
});

test(`isVisible() returns false for a text node with a parent element with
      \`opacity: 0\``, (t) => {
  const text = h.text("Hello world");

  const element = <div style={{ opacity: "0" }}>{text}</div>;

  t(!isVisible(text));
  t(!isVisible(element));
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

  t(isVisible(element));
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

  t(!isVisible(element));
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

  t(isVisible(element));
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

  t(isVisible(element));
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

  t(!isVisible(text));
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

  t(isVisible(text));
});

test(`isVisible() consider that images' concrete dimensions are the specified ones`, (t) => {
  const img = (
    <img src="foo.jpg" style={{ width: "0px", overflow: "visible" }} />
  );
  const div = (
    <div style={{ width: "0px", overflow: "visible" }}>Hello World</div>
  );

  h.document([img, div]);

  t(!isVisible(img));
  t(isVisible(div));
});

test("isVisible() returns false for `<option>` that are not shown, and their content", (t) => {
  for (let size = 2; size < 6; size++) {
    const options = [
      <option>one</option>,
      <option>two</option>,
      <option>three</option>,
      <option>four</option>,
      <option>five</option>,
    ] as Array<Element<"option">>;

    <select size={`${size}`}>{options}</select>;

    for (let i = 0; i < size; i++) {
      for (const node of options[i].inclusiveDescendants()) t(isVisible(node));
    }
    for (let i = size; i < 5; i++) {
      for (const node of options[i].inclusiveDescendants()) t(!isVisible(node));
    }
  }
});

test("isVisible() returns true for single line `<select>`", (t) => {
  const options = [<option>one</option>, <option>two</option>];

  const select = <select>{options}</select>;

  for (const node of options) {
    // None of the `<option>` is visible, due to being a single line `<select>`
    t(!isVisible(node));
  }

  // The `<select>` is nonetheless visible, showing the value of the first `<option>`.
  t(isVisible(select));
});

test("isVisible() returns true for content of open `<details>`", (t) => {
  const content = <div>World</div>;
  const details = (
    <details open>
      <summary>Hello</summary>
      {content}
    </details>
  );

  h.document([details]);

  t(isVisible(content));
});

test("isVisible() returns false for content of closed `<details>`", (t) => {
  const content = <div>World</div>;
  const details = (
    <details>
      <summary>Hello</summary>
      {content}
    </details>
  );

  h.document([details]);

  t(!isVisible(content));
});

test("isVisible() returns true for summary of open `<details>`", (t) => {
  const summary = <summary>Hello</summary>;
  const details = (
    <details open>
      {summary}
      <div>World</div>
    </details>
  );

  h.document([details]);

  t(isVisible(summary));
});

test("isVisible() returns true for summary of closed `<details>`", (t) => {
  const summary = <summary>Hello</summary>;
  const details = (
    <details>
      {summary}
      <div>World</div>
    </details>
  );

  h.document([details]);

  t(isVisible(summary));
});
