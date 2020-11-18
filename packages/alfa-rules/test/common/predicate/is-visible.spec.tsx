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

  t.equal(isVisible(element), true);
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

  t.equal(isVisible(element), true);
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
