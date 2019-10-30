import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Browser } from "@siteimprove/alfa-compatibility";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { None, Some } from "@siteimprove/alfa-option";
import { getRole } from "../src/get-role";
import * as Roles from "../src/roles";

const device = getDefaultDevice();

test("Returns the semantic role of an element when explicitly set", t => {
  const button = <div role="button">Button</div>;

  t.deepEqual(getRole(button, button, device).toJSON(), {
    values: [
      {
        value: Some.of(Roles.Button),
        branches: null
      }
    ]
  });
});

test("Returns the semantic role of an element when implicitly set", t => {
  const button = <button>Button</button>;

  t.deepEqual(getRole(button, button, device).toJSON(), {
    values: [
      {
        value: Some.of(Roles.Button),
        branches: null
      }
    ]
  });
});

test("Returns the first valid role when multiple roles are set", t => {
  const button = <div role="foo button link">Button</div>;

  t.deepEqual(getRole(button, button, device).toJSON(), {
    values: [
      {
        value: Some.of(Roles.Button),
        branches: null
      }
    ]
  });
});

test("Does not consider abstract roles", t => {
  const widget = <div role="widget" />;

  t.deepEqual(getRole(widget, widget, device).toJSON(), {
    values: [
      {
        value: None,
        branches: null
      }
    ]
  });
});

test("Falls back on an implicit role of an invalid role is set", t => {
  const button = <button role="foo">Button</button>;

  t.deepEqual(getRole(button, button, device).toJSON(), {
    values: [
      {
        value: Some.of(Roles.Button),
        branches: null
      }
    ]
  });
});

test("Deals with case-sensitivity issues in Firefox", t => {
  const button = <div role="BUTTON img">Button</div>;

  t.deepEqual(getRole(button, button, device).toJSON(), {
    values: [
      {
        value: Some.of(Roles.Button),
        branches: null
      },
      {
        value: Some.of(Roles.Img),
        branches: [...Browser.query(["firefox"])]
      }
    ]
  });
});

test("Returns the semantic role of a form", t => {
  const form = (
    <form>
      <input type="text" />
    </form>
  );

  t.deepEqual(getRole(form, form, device).toJSON(), {
    values: [
      {
        value: Some.of(Roles.Form),
        branches: null
      }
    ]
  });
});
