import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom/h";

import { isInert } from "../../../src/element/predicate/is-inert.js";

const device = Device.standard();
const inert = isInert(device);

test("isInert() returns false for elements with visibility: visible", (t) => {
  t.equal(inert(<div style={{ visibility: "visible" }} />), false);
});

test("isInert() returns true for elements with visibility: hidden", (t) => {
  t.equal(inert(<div style={{ visibility: "hidden" }} />), true);
});

test("isInert() returns true for elements with visibility: collapse", (t) => {
  t.equal(inert(<div style={{ visibility: "collapse" }} />), true);
});

test("isInert() returns false by default", (t) => {
  t.equal(inert(<div />), false);
});

test("isInert() returns true for elements inheriting visibility: hidden", (t) => {
  const child = <div />;
  const parent = <div style={{ visibility: "hidden" }}>{child}</div>;

  h.document([parent]);

  t.equal(inert(child), true);
});

test("isInert() returns true when stylesheet applies visibility: hidden", (t) => {
  const element = <div class="hidden" />;

  h.document(
    [element],
    [h.sheet([h.rule.style(".hidden", { visibility: "hidden" })])],
  );

  t.equal(inert(element), true);
});

test("isInert() returns true for elements with the inert attribute", (t) => {
  t.equal(inert(<div inert />), true);
});

test("isInert() returns true for descendants of elements with the inert attribute", (t) => {
  const child = <span>Text</span>;
  const parent = <div inert>{child}</div>;

  h.document([parent]);

  t.equal(inert(child), true);
});

test("isInert() returns true for nested descendants of elements with the inert attribute", (t) => {
  const descendant = <em>Text</em>;
  const div = (
    <div inert>
      <span>{descendant}</span>
    </div>
  );

  h.document([div]);

  t.equal(inert(descendant), true);
});

test("isInert() returns false for open dialog", (t) => {
  const dialog = <dialog open>Hello, from open dialog</dialog>;
  const parent = <div inert>{dialog}</div>;

  h.document([parent]);

  t.equal(inert(dialog), false);
});

test("isInert() returns false for child of open dialog", (t) => {
  const div = <div>Hello, from child of open dialog</div>;
  const dialog = <dialog open>{div}</dialog>;
  const parent = <div inert>{dialog}</div>;

  h.document([parent]);

  t.equal(inert(div), false);
});

test("isInert() returns true for open dialog with explicit inert attribute", (t) => {
  const dialog = (
    <dialog open inert>
      <div>Hello from inert open dialog</div>
    </dialog>
  );
  const parent = <div>{dialog}</div>;

  h.document([parent]);

  t.equal(inert(dialog), true);
});

test("isInert() returns true for child of open dialog with explicit inert attribute", (t) => {
  const div = <div>Hello from inert open dialog</div>;
  const dialog = (
    <dialog open inert>
      {div}
    </dialog>
  );
  const parent = <div>{dialog}</div>;

  h.document([parent]);

  t.equal(inert(div), true);
});
