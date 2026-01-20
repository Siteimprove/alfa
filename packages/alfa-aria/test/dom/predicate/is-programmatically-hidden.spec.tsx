import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

import { DOM } from "../../../dist/index.js";

const device = Device.standard();
const isProgrammaticallyHidden = DOM.isProgrammaticallyHidden(device);

test("isProgrammaticallyHidden() returns false for visible elements", (t) => {
  const button = <button>Click me</button>;
  h.document([button]);

  t(!isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements with display: none", (t) => {
  const button = <button style={{ display: "none" }}>Hidden</button>;
  h.document([button]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements with visibility: hidden", (t) => {
  const button = <button style={{ visibility: "hidden" }}>Hidden</button>;
  h.document([button]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements with visibility: collapse", (t) => {
  const button = <button style={{ visibility: "collapse" }}>Hidden</button>;
  h.document([button]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns false for elements with visibility: visible", (t) => {
  const button = <button style={{ visibility: "visible" }}>Visible</button>;
  h.document([button]);

  t(!isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements with aria-hidden='true'", (t) => {
  const button = <button aria-hidden="true">Hidden</button>;
  h.document([button]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns false for elements with aria-hidden='false'", (t) => {
  const button = <button aria-hidden="false">Visible</button>;
  h.document([button]);

  t(!isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for inert elements", (t) => {
  const button = <button inert>Inert</button>;
  h.document([button]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements inside inert container", (t) => {
  const button = <button>Not inert itself</button>;
  const parent = <div inert>{button}</div>;
  h.document([parent]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements with display: none ancestor", (t) => {
  const button = <button>Hidden by ancestor</button>;
  const parent = <div style={{ display: "none" }}>{button}</div>;
  h.document([parent]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements with aria-hidden='true' ancestor", (t) => {
  const button = <button>Hidden by ancestor</button>;
  const parent = <div aria-hidden="true">{button}</div>;
  h.document([parent]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements with visibility: hidden ancestor", (t) => {
  const button = <button>Hidden by ancestor</button>;
  const parent = <div style={{ visibility: "hidden" }}>{button}</div>;
  h.document([parent]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements with visibility: collapse ancestor", (t) => {
  const button = <button>Hidden by ancestor</button>;
  const parent = <div style={{ visibility: "collapse" }}>{button}</div>;
  h.document([parent]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for deeply nested hidden elements", (t) => {
  const button = <button>Deeply hidden</button>;
  const level2 = <div>{button}</div>;
  const level1 = <div aria-hidden="true">{level2}</div>;
  h.document([level1]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns false for elements inside open dialog within inert container", (t) => {
  const button = <button>Should be visible</button>;
  const dialog = <dialog open>{button}</dialog>;
  const parent = <div inert>{dialog}</div>;
  h.document([parent]);

  t(!isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements with multiple hiding conditions", (t) => {
  const button = (
    <button aria-hidden="true" style={{ display: "none" }}>
      Multiple conditions
    </button>
  );
  h.document([button]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns false for visible elements with visible ancestors", (t) => {
  const button = <button>Visible</button>;
  const parent = <div>{button}</div>;
  const grandparent = <section>{parent}</section>;
  h.document([grandparent]);

  t(!isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns true for elements with display: none even if aria-hidden='false'", (t) => {
  const button = (
    <button aria-hidden="false" style={{ display: "none" }}>
      Hidden
    </button>
  );
  h.document([button]);

  t(isProgrammaticallyHidden(button));
});

test("isProgrammaticallyHidden() returns false for elements with display: block", (t) => {
  const button = <button style={{ display: "block" }}>Visible</button>;
  h.document([button]);

  t.equal(isProgrammaticallyHidden(button), false);
});

test("isProgrammaticallyHidden() handles mixed visibility in hierarchy", (t) => {
  const visibleButton = <button>Visible</button>;
  const hiddenButton = <button>Hidden</button>;
  const hiddenDiv = <div aria-hidden="true">{hiddenButton}</div>;
  const parent = (
    <div>
      {visibleButton}
      {hiddenDiv}
    </div>
  );
  h.document([parent]);

  t(!isProgrammaticallyHidden(visibleButton));
  t(isProgrammaticallyHidden(hiddenButton));
});
