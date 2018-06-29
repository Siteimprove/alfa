import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../../src/get-role";
import * as Roles from "../../src/roles";

test("Returns the semantic role of an input whose type is button", t => {
  const input = <input type="button" />;
  t.equal(getRole(input, input), Roles.Button);
});

test("Returns the semantic role of an input whose type is checkbox", t => {
  const input = <input type="checkbox" />;
  t.equal(getRole(input, input), Roles.Checkbox);
});

test("Returns null if an input has type color", t => {
  const input = <input type="color" />;
  t.equal(getRole(input, input), null);
});

test("Returns null if an input has type date", t => {
  const input = <input type="date" />;
  t.equal(getRole(input, input), null);
});

test("Returns null if an input has type datetime", t => {
  const input = <input type="datetime" />;
  t.equal(getRole(input, input), null);
});

test("Returns the semantic role of an input if its type is email and it has no list attribute", t => {
  const input = <input type="email" />;
  t.equal(getRole(input, input), Roles.TextBox);
});

//test("Returns null if an input has type email and it has a list attribute", t => {
//TODO fix
//});

test("Returns null if an input has type file", t => {
  const input = <input type="file" />;
  t.equal(getRole(input, input), null);
});

test("Returns null if an input has type hidden", t => {
  const input = <input type="hidden" />;
  t.equal(getRole(input, input), null);
});

test("Returns the semantic role of an input whose type is image", t => {
  const input = <input type="image" />;
  t.equal(getRole(input, input), Roles.Button);
});

test("Returns null if an input has type month", t => {
  const input = <input type="month" />;
  t.equal(getRole(input, input), null);
});

test("Returns the semantic role of an input whose type is number", t => {
  const input = <input type="number" />;
  t.equal(getRole(input, input), Roles.SpinButton);
});

test("Returns null if an input has type password", t => {
  const input = <input type="password" />;
  t.equal(getRole(input, input), null);
});

test("Returns the semantic role of an input whose type is radio", t => {
  const input = <input type="radio" />;
  t.equal(getRole(input, input), Roles.Radio);
});

test("Returns the semantic role of an input whose type is range", t => {
  const input = <input type="range" />;
  t.equal(getRole(input, input), Roles.Slider);
});

test("Returns the semantic role of an input whose type is reset", t => {
  const input = <input type="reset" />;
  t.equal(getRole(input, input), Roles.Button);
});

test("Returns the semantic role of an input whose type is submit", t => {
  const input = <input type="submit" />;
  t.equal(getRole(input, input), Roles.Button);
});

test("Returns the semantic role of an input whose type is range", t => {
  const input = <input type="range" />;
  t.equal(getRole(input, input), Roles.Slider);
});

test("Returns null if an input has type week", t => {
  const input = <input type="week" />;
  t.equal(getRole(input, input), null);
});
