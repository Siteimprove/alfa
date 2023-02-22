import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";

// Due to hasRole depending on Role, we need to make sure everything
// is imported in the correct order. This is enforced by importing DOM from
// the package's top-level, rather than hasRole from its own file.
import { DOM } from "../../../src/index";

const device = Device.standard();

test("hasIncorrectRoleWithoutName returns true for nameless `<section>`", (t) => {
  const target = <section>Sections without name have no role</section>;

  h.document([target]);

  // Role is incorrectly set
  t.deepEqual(DOM.hasRole(device, "region")(target), true);
  t.deepEqual(DOM.hasIncorrectRoleWithoutName(device)(target), true);
});

test("hasIncorrectRoleWithoutName returns false for named `<section>`", (t) => {
  const target = (
    <section aria-label="My section">
      Sections with name have region role
    </section>
  );

  h.document([target]);

  t.deepEqual(DOM.hasRole(device, "region")(target), true);
  t.deepEqual(DOM.hasIncorrectRoleWithoutName(device)(target), false);
});

test("hasIncorrectRoleWithoutName returns false for `<section>` with explicit role", (t) => {
  const target = (
    <section role="region">Sections with an explicit role are honored</section>
  );

  h.document([target]);

  t.deepEqual(DOM.hasRole(device, "region")(target), true);
  t.deepEqual(DOM.hasIncorrectRoleWithoutName(device)(target), false);
});
