import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../src/get-role";
import * as Roles from "../src/roles";

test("Returns the semantic role of an element when explicitly set", t => {
  const button = <div role="button">Button</div>;
  t.is(getRole(button, button), Roles.Button);
});

test("Returns the semantic role of an element when implicitly set", t => {
  const button = <button>Button</button>;
  t.is(getRole(button, button), Roles.Button);
});

test("Returns the first valid role when multiple roles are set", t => {
  const button = <div role="foo button link">Button</div>;
  t.is(getRole(button, button), Roles.Button);
});

test("Does not consider abstract roles", t => {
  const widget = <div role="widget" />;
  t.is(getRole(widget, widget), null);
});

test("Returns the semantic role of an anchor that has an href attribute", t => {
  const a = <a href="foo">Foo</a>;
  t.is(getRole(a, a), Roles.Link);
});

test("Returns null when an anchor has no href attribute", t => {
  const a = <a>Foo</a>;
  t.is(getRole(a, a), null);
});
