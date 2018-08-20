import { Browser, setSupportedBrowsers } from "@siteimprove/alfa-compatibility";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../src/get-role";
import * as Roles from "../src/roles";

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

test("Is case-insensitive when not supporting Firefox", t => {
  const button = <div role="BUTTON">Button</div>;

  setSupportedBrowsers([[Browser.Chrome, ">", "50"]], () => {
    t.equal(getRole(button, button), Roles.Button);
  });
});

test("Is case-sensitive when supporting Firefox", t => {
  const button = <div role="BUTTON">Button</div>;

  setSupportedBrowsers([[Browser.Firefox, ">", "50"]], () => {
    t.equal(getRole(button, button), null);
  });
});
