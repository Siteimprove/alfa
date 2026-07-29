import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

// Due to hasRole depending on Role, we need to make sure everything
// is imported in the correct order. This is enforced by importing DOM from
// the package's top-level, rather than hasRole from its own file.
import { DOM } from "../../../src/index.ts";

const device = Device.standard();

test("isNotLandmarkWithoutName returns true for nameless `<form>`", (t) => {
  const target = <form>Forms without name are not landmarks</form>;

  h.document([target]);

  // Form is not a landmark
  t.deepEqual(DOM.hasRole(device, "form")(target), true);
  t.deepEqual(DOM.isNotLandmarkWithoutName(device)(target), true);
});

test("isNotLandmarkWithoutName returns false for named `<form>`", (t) => {
  const target = (
    <form aria-label="My form">
      Forms with name are landmarks
    </form>
  );

  h.document([target]);

  t.deepEqual(DOM.hasRole(device, "form")(target), true);
  t.deepEqual(DOM.isNotLandmarkWithoutName(device)(target), false);
});

test("isNotLandmarkWithoutName returns false for explicit `<form>`", (t) => {
  const target = (
    <div role="form">
      Forms with explicit role are landmarks
    </div>
  );

  h.document([target]);

  t.deepEqual(DOM.hasRole(device, "form")(target), true);
  t.deepEqual(DOM.isNotLandmarkWithoutName(device)(target), false);
});
