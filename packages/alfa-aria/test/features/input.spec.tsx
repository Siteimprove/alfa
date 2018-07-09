import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import * as Roles from "../../src/roles";
import { Input } from "../../src/features/input";
import { None } from "../../src/types";

/**
 * @see https://www.w3.org/TR/html-aria/#input
 */

test("Returns the semantic role of an input whose type is button", t => {
  const input = <input type="button" />;
  t.equal(
    Input.role!(input, input),
    Roles.Button,
    "The role of input is not Button"
  );
});

test("Returns the semantic role of an input whose type is checkbox", t => {
  const input = <input type="checkbox" />;
  t.equal(
    Input.role!(input, input),
    Roles.Checkbox,
    "The role of input is not Checkbox"
  );
});

test("Returns no role if an input has type color", t => {
  const input = <input type="color" />;
  t.equal(Input.role!(input, input), null, "The role of input is not null");
});

test("Returns no role if an input has type date", t => {
  const input = <input type="date" />;
  t.equal(Input.role!(input, input), null, "The role of input is not null");
});

test("Returns no role if an input has type datetime", t => {
  const input = <input type="datetime" />;
  t.equal(Input.role!(input, input), null, "The role of input is not null");
});

test("Returns the semantic role of an input if its type is email and it has no list attribute", t => {
  const input = <input type="email" />;
  t.equal(
    Input.role!(input, input),
    Roles.TextBox,
    "The role of input is not Textbox"
  );
});

test("Returns no role if an input has type file", t => {
  const input = <input type="file" />;
  t.equal(Input.role!(input, input), null, "The role of input is not null");
});

test("Returns no role if an input has type hidden", t => {
  const input = <input type="hidden" />;
  t.equal(Input.role!(input, input), null, "The role of input is not null");
});

test("Returns the semantic role of an input whose type is image", t => {
  const input = <input type="image" />;
  t.equal(
    Input.role!(input, input),
    Roles.Button,
    "The role of input is not Button"
  );
});

test("Returns no role if an input has type month", t => {
  const input = <input type="month" />;
  t.equal(Input.role!(input, input), null, "The role of input is not null");
});

test("Returns the semantic role of an input whose type is number", t => {
  const input = <input type="number" />;
  t.equal(
    Input.role!(input, input),
    Roles.SpinButton,
    "The role of input is not Spinbutton"
  );
});

test("Returns null as the semantic role if an input has type password", t => {
  const input = <input type="password" />;
  t.equal(Input.role!(input, input), null, "The role of input is not null");
});

test("Returns the semantic role of an input whose type is radio", t => {
  const input = <input type="radio" />;
  t.equal(
    Input.role!(input, input),
    Roles.Radio,
    "The role of input is not Radio"
  );
});

test("Returns the semantic role of an input whose type is range", t => {
  const input = <input type="range" />;
  t.equal(
    Input.role!(input, input),
    Roles.Slider,
    "The role of input is not Slider"
  );
});

test("Returns the semantic role of an input whose type is range", t => {
  const input = <input type="range" />;
  t.equal(
    Input.role!(input, input),
    Roles.Slider,
    "The role of input is not Slider"
  );
});

test("Returns the semantic role of an input whose type is reset", t => {
  const input = <input type="reset" />;
  t.equal(
    Input.role!(input, input),
    Roles.Button,
    "The role of input is not Button"
  );
});

test("Returns the semantic role of an input whose type is search and it has no list attribute", t => {
  const input = <input type="search" />;
  t.equal(
    Input.role!(input, input),
    Roles.SearchBox,
    "The role of input is not Searchbox"
  );
});

test("Returns the semantic role of an input whose type is submit", t => {
  const input = <input type="submit" />;
  t.equal(
    Input.role!(input, input),
    Roles.Button,
    "The role of input is not Button"
  );
});

test("Returns the semantic role of an input whose type is tel and it has no list attribute", t => {
  const input = <input type="tel" />;
  t.equal(
    Input.role!(input, input),
    Roles.TextBox,
    "The role of input is not Textbox"
  );
});

test("Returns the semantic role of an input whose type is text and it has no list attribute", t => {
  const input = <input type="text" />;
  t.equal(
    Input.role!(input, input),
    Roles.TextBox,
    "The role of input is not Textbox"
  );
});

test("Returns the semantic role of an input whose type is text and it has a list attribute", t => {
  const datalist = <datalist id="testlist" />;
  const input = <input type="text" list="testlist" />;
  const div = (
    <div>
      {datalist}
      {input}
    </div>
  );
  t.equal(
    Input.role!(input, div),
    Roles.Combobox,
    "The role of input is not Combobox"
  );
});

test("Returns the semantic role of an input whose type is search and it has a list attribute", t => {
  const datalist = <datalist id="testlist" />;
  const input = <input type="search" list="testlist" />;
  const div = (
    <div>
      {datalist}
      {input}
    </div>
  );
  t.equal(
    Input.role!(input, div),
    Roles.Combobox,
    "The role of input is not Combobox"
  );
});

test("Returns the semantic role of an input whose type is tel and it has a list attribute", t => {
  const datalist = <datalist id="testlist" />;
  const input = <input type="tel" list="testlist" />;
  const div = (
    <div>
      {datalist}
      {input}
    </div>
  );
  t.equal(
    Input.role!(input, div),
    Roles.Combobox,
    "The role of input is not Combobox"
  );
});

test("Returns the semantic role of an input whose type is url and it has a list attribute", t => {
  const datalist = <datalist id="testlist" />;
  const input = <input type="url" list="testlist" />;
  const div = (
    <div>
      {datalist}
      {input}
    </div>
  );
  t.equal(
    Input.role!(input, div),
    Roles.Combobox,
    "The role of input is not Combobox"
  );
});

test("Returns the semantic role of an input whose type is email and it has a list attribute", t => {
  const datalist = <datalist id="testlist" />;
  const input = <input type="email" list="testlist" />;
  const div = (
    <div>
      {datalist}
      {input}
    </div>
  );
  t.equal(
    Input.role!(input, div),
    Roles.Combobox,
    "The role of input is not Combobox"
  );
});

test("Returns null if an input has type time", t => {
  const input = <input type="time" />;
  t.equal(Input.role!(input, input), null, "The role of input is not null");
});

test("Returns the semantic role of an input whose type is url", t => {
  const input = <input type="url" />;
  t.equal(
    Input.role!(input, input),
    Roles.TextBox,
    "The role of input is not Textbox"
  );
});

test("Returns null if an input has type week", t => {
  const input = <input type="week" />;
  t.equal(Input.role!(input, input), null, "The role of input is not null");
});

test("Returns the allowed roles of an input whose type is button", t => {
  const input = <input type="button" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    [
      Roles.Link,
      Roles.MenuItem,
      Roles.MenuItemCheckbox,
      Roles.MenuItemRadio,
      Roles.Option,
      Roles.Radio,
      Roles.Switch,
      Roles.Tab
    ],
    "Input allowed roles are incorrect"
  );
});

test("Returns the allowed roles of an input whose type is checkbox and has an aria-pressed attribute", t => {
  const input = <input type="checkbox" aria-pressed="true" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    [Roles.Button, Roles.MenuItemCheckbox, Roles.Option, Roles.Switch],
    "Input allowed roles are incorrect"
  );
});

test("Returns the allowed roles of an input whose type is checkbox and has no aria-pressed attribute", t => {
  const input = <input type="checkbox" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    [Roles.MenuItemCheckbox, Roles.Option, Roles.Switch],
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type color", t => {
  const input = <input type="color" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type date", t => {
  const input = <input type="date" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type datetime", t => {
  const input = <input type="datetime" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type email and no list attribute", t => {
  const input = <input type="email" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type email", t => {
  const datalist = <datalist id="testlist" />;
  const input = <input type="email" />;
  const div = (
    <div>
      {datalist}
      {input}
    </div>
  );
  t.deepEqual(
    Input.allowedRoles(input, div),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type file", t => {
  const input = <input type="file" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type hidden", t => {
  const input = <input type="hidden" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns the allowed roles of an input whose type is image", t => {
  const input = <input type="image" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    [
      Roles.Link,
      Roles.MenuItem,
      Roles.MenuItemCheckbox,
      Roles.MenuItemRadio,
      Roles.Radio,
      Roles.Switch
    ],
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type month", t => {
  const input = <input type="month" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type number", t => {
  const input = <input type="number" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type password", t => {
  const input = <input type="password" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns the allowed roles of an input whose type is radio", t => {
  const input = <input type="radio" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    [Roles.MenuItemRadio],
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type range", t => {
  const input = <input type="range" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type reset", t => {
  const input = <input type="reset" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type search", t => {
  const input = <input type="search" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type submit", t => {
  const input = <input type="submit" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type tel", t => {
  const input = <input type="tel" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns the allowed roles of an input whose type is text and has no list attribute", t => {
  const input = <input type="text" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    [Roles.Combobox, Roles.SearchBox, Roles.SpinButton],
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type text and has a list attribute", t => {
  const datalist = <datalist id="testlist" />;
  const input = <input type="text" list="testlist" />;
  const div = (
    <div>
      {datalist}
      {input}
    </div>
  );
  t.deepEqual(
    Input.allowedRoles(input, div),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type url", t => {
  const input = <input type="url" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});

test("Returns no allowed roles when an input has type week", t => {
  const input = <input type="week" />;
  t.deepEqual(
    Input.allowedRoles(input, input),
    None,
    "Input allowed roles are incorrect"
  );
});
