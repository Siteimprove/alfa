import { BrowserSpecific, withBrowsers } from "@siteimprove/alfa-compatibility";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../src/get-role";
import * as Roles from "../src/roles";
import { Role } from "../src/types";

const device = getDefaultDevice();

test("Returns the semantic role of an element when explicitly set", t => {
  const button = <div role="button">Button</div>;
  t.equal(getRole(button, button, device), Roles.Button);
});

test("Returns the semantic role of an element when implicitly set", t => {
  const button = <button>Button</button>;
  t.equal(getRole(button, button, device), Roles.Button);
});

test("Returns the first valid role when multiple roles are set", t => {
  const button = <div role="foo button link">Button</div>;
  t.equal(getRole(button, button, device), Roles.Button);
});

test("Does not consider abstract roles", t => {
  const widget = <div role="widget" />;
  t.equal(getRole(widget, widget, device), null);
});

test("Falls back on an implicit role of an invalid role is set", t => {
  const button = <button role="foo">Button</button>;
  t.equal(getRole(button, button, device), Roles.Button);
});

test("Is case-insensitive when not supporting Firefox", t => {
  const button = <div role="BUTTON">Button</div>;

  withBrowsers(["chrome"], () => {
    t.equal(getRole(button, button, device), Roles.Button);
  });
});

test("Is case-sensitive when supporting Firefox", t => {
  const button = <div role="BUTTON img">Button</div>;

  withBrowsers(["chrome", "firefox"], () => {
    t.deepEqual(
      getRole(button, button, device),
      BrowserSpecific.of<Role | null>(Roles.Img, ["firefox"]).branch(
        Roles.Button,
        ["chrome"]
      )
    );
  });
});

test("Can get the role of a form", t => {
  const form = (
    <form>
      <input type="text" />
    </form>
  );

  t.equal(getRole(form, form, device), Roles.Form);
});
