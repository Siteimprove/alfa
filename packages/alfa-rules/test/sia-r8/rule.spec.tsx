import { h, Element } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R8, { Outcomes } from "../../dist/sia-r8/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes an input element with implicit label", async (t) => {
  const target = <input />;

  const label = (
    <label>
      first name
      {target}
    </label>
  );

  const document = h.document([label]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.FormFieldWithAriaRoleHasName("textbox"),
    }),
  ]);
});

test("evaluate() passes an input element with aria-label", async (t) => {
  const target = <input aria-label="last name" disabled />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.FormFieldWithAriaRoleHasName("textbox"),
    }),
  ]);
});

test("evaluate() passes a select element with explicit label", async (t) => {
  const target = (
    <select id="country">
      <option>England</option>
      <option>Scotland</option>
      <option>Wales</option>
      <option>Northern Ireland</option>
    </select>
  );

  const label = <label for="country">Country</label>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.FormFieldWithAriaRoleHasName("listbox"),
    }),
  ]);
});

test("evaluate() passes a textarea element with aria-labelledby", async (t) => {
  const target = <textarea aria-labelledby="country"></textarea>;

  const label = <div id="country">Country</div>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.FormFieldWithAriaRoleHasName("textbox"),
    }),
  ]);
});

test("evaluate() passes a input element with placeholder attribute", async (t) => {
  const target = <input placeholder="Your search query" />;

  const label = <button type="submit">search</button>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.FormFieldWithAriaRoleHasName("textbox"),
    }),
  ]);
});

test(`evaluate() passes a div element with explicit combobox role and an
     aria-label attribute`, async (t) => {
  const role = "combobox";

  const target = (
    <div aria-label="country" role={role} aria-disabled="true">
      England
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.FormFieldWithAriaRoleHasName(role),
    }),
  ]);
});

test("evaluate() fails a input element without accessible name", async (t) => {
  const target = <input />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.FormFieldWithAriaRoleHasNoName("textbox"),
    }),
  ]);
});

test("evaluate() fails a input element with empty aria-label", async (t) => {
  const target = <input aria-label=" " />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.FormFieldWithAriaRoleHasNoName("textbox"),
    }),
  ]);
});

test(`evaluate() fails a select element with aria-labelledby pointing to an
     empty element`, async (t) => {
  const target = (
    <select aria-labelledby="country">
      <option>England</option>
    </select>
  );

  const label = <div id="country"></div>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.FormFieldWithAriaRoleHasNoName("listbox"),
    }),
  ]);
});

test("evaluate() fails a textbox with no accessible name", async (t) => {
  const role = "textbox";

  const target = <div role={role}></div>;

  const label = (
    <label>
      first name
      {target}
    </label>
  );
  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.FormFieldWithAriaRoleHasNoName(role),
    }),
  ]);
});

test("evaluate() is inapplicable for an element with aria-hidden", async (t) => {
  const target = <input disabled aria-hidden="true" aria-label="firstname" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});

test("evaluate() is inapplicable for a disabled element", async (t) => {
  const target = (
    <select role="none" disabled>
      <option value="volvo">Volvo</option>
      <option value="saab">Saab</option>
      <option value="opel">Opel</option>
    </select>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});

test("evaluate() is inapplicable for an element which is not displayed", async (t) => {
  const target = <input aria-label="firstname" style={{ display: "none" }} />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});

test(`evaluate() fails an input element with type=password which is disabled 
    and without accessible name`, async (t) => {
  const target = <input type="password" disabled/>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.InputElementWithNoAriaRoleHasNoName("password"),
    }),
  ]);
});

test("evaluate() passes an input element with type=password and implicit label", async (t) => {
  const target = <input  type="password"/>;

  const label = (
    <label>
      password
      {target}
    </label>
  );

  const document = h.document([label]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.InputElementWithNoAriaRoleHasName("password"),
    }),
  ]);
});

test("evaluate() passes an input element with type=password and aria-label", async (t) => {
  const target = <input type="password" aria-label="password" disabled />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.InputElementWithNoAriaRoleHasName("password"),
    }),
  ]);
});

test("evaluate() passes an input element with type=password and explicit label", async (t) => {
  const target = <input type="password" id="pwd" />;

  const label = <label for="pwd">Password</label>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.InputElementWithNoAriaRoleHasName("password"),
    }),
  ]);
});

test("evaluate() passes an input element with type=password and aria-labelledby", async (t) => {
  const target = <input type="password" aria-labelledby="pwd" />;

  const label = <div id="pwd">Password</div>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.InputElementWithNoAriaRoleHasName("password"),
    }),
  ]);
});

test("evaluate() passes an input element with type=password and placeholder attribute", async (t) => {
  const target = <input type="password" placeholder="Enter your password" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    passed(R8, target, {
      1: Outcomes.InputElementWithNoAriaRoleHasName("password"),
    }),
  ]);
});

test("evaluate() fails an input element with type=password and empty aria-label", async (t) => {
  const target = <input type="password" aria-label=" " />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.InputElementWithNoAriaRoleHasNoName("password"),
    }),
  ]);
});

test(`evaluate() fails an input element with type=password and aria-labelledby pointing to an
     empty element`, async (t) => {
  const target = <input type="password" aria-labelledby="country" />;

  const label = <div id="country"></div>;

  const document = h.document([label, target]);

  t.deepEqual(await evaluate(R8, { document }), [
    failed(R8, target, {
      1: Outcomes.InputElementWithNoAriaRoleHasNoName("password"),
    }),
  ]);
});

test(`evaluate() is inapplicable for an input element with type=password 
    and aria-hidden`, async (t) => {
  const target = <input type="password" aria-hidden="true" aria-label="password" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});

test(`evaluate() is inapplicable for an element with type=password and which 
    is not displayed`, async (t) => {
  const target = <input type="password" aria-label="password" style={{ display: "none" }} />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R8, { document }), [inapplicable(R8)]);
});

test(`evaluate() fails for input elements with various types which give it no ARIA 
    role and which have no accessible name`, async (t) => {
  for (const type of ["color", "date", "datetime-local", "file", "month", "time", "week"]) {
    const target = <input type={type}/>;
    const document = h.document([target]);
    t.deepEqual(await evaluate(R8, { document }), 
      [failed(R8, target, {1: Outcomes.InputElementWithNoAriaRoleHasNoName(type as Element.InputType)})]);
  }
});

test(`evaluate() passes for input elements with various types which give it no ARIA 
    role and which have an aria-label`, async (t) => {
  for (const type of ["color", "date", "datetime-local", "file", "month", "time", "week"]) {
    const target = <input type={type} aria-label="x"/>;
    const document = h.document([target]);
    t.deepEqual(await evaluate(R8, { document }), 
      [passed(R8, target, {1: Outcomes.InputElementWithNoAriaRoleHasName(type as Element.InputType)})]);
  }
});
