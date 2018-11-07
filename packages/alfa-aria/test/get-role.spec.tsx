import { BrowserSpecific, withBrowsers } from "@siteimprove/alfa-compatibility";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../src/get-role";
import * as Roles from "../src/roles";
import { Role } from "../src/types";

test("Returns the semantic role of an element when explicitly set", t => {
  const button = <div role="button">Button</div>;
  t.equal(getRole(button, button), Roles.Button);
});

test("Returns the semantic role of an element when implicitly set", t => {
  const button = <button>Button</button>;
  t.equal(getRole(button, button), Roles.Button);
});

test("Returns the first valid role when multiple roles are set", t => {
  const button = <div role="foo button link">Button</div>;
  t.equal(getRole(button, button), Roles.Button);
});

test("Does not consider abstract roles", t => {
  const widget = <div role="widget" />;
  t.equal(getRole(widget, widget), null);
});

test("Falls back on an implicit role of an invalid role is set", t => {
  const button = <button role="foo">Button</button>;
  t.equal(getRole(button, button), Roles.Button);
});

test("Is case-insensitive when not supporting Firefox", t => {
  const button = <div role="BUTTON">Button</div>;

  withBrowsers(["chrome"], () => {
    t.equal(getRole(button, button), Roles.Button);
  });
});

test("Is case-sensitive when supporting Firefox", t => {
  const button = <div role="BUTTON img">Button</div>;

  withBrowsers(["chrome", "firefox"], () => {
    t.deepEqual(
      getRole(button, button),
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

  t.equal(getRole(form, form), Roles.Form);
});
