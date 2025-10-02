import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R120, { Outcomes } from "../../dist/sia-r120/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes an input with explicit label", async (t) => {
  const target = <input type="text" id="username" />;
  const document = h.document([
    <html>
      <body>
        <label htmlFor="username">Username</label>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, target, {
      1: Outcomes.HasProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});

test("evaluate() passes an input with implicit label", async (t) => {
  const target = <input type="text" />;
  const document = h.document([
    <html>
      <body>
        <label>
          Username
          {target}
        </label>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, target, {
      1: Outcomes.HasProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});

test("evaluate() passes an input with aria-label", async (t) => {
  const target = <input type="text" aria-label="Username" />;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, target, {
      1: Outcomes.HasProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});

test("evaluate() passes an input with aria-labelledby", async (t) => {
  const target = <input type="text" aria-labelledby="username-label" />;
  const document = h.document([
    <html>
      <body>
        <span id="username-label">Username</span>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, target, {
      1: Outcomes.HasProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});

test("evaluate() fails an input without proper label", async (t) => {
  const target = <input type="text" />;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    failed(R120, target, {
      1: Outcomes.HasNoProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});

test("evaluate() passes a textarea with proper label and instructions", async (t) => {
  const target = <textarea id="message"></textarea>;
  const document = h.document([
    <html>
      <body>
        <label htmlFor="message">Message</label>
        <div id="message-help" aria-describedby="message-help">
          Enter your message here (max 500 characters)
        </div>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, target, {
      1: Outcomes.HasProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});

test("evaluate() passes a select with proper label", async (t) => {
  const target = <select id="country">
    <option value="us">United States</option>
    <option value="ca">Canada</option>
  </select>;
  
  const document = h.document([
    <html>
      <body>
        <label htmlFor="country">Country</label>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, target, {
      1: Outcomes.HasProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});

test("evaluate() passes a button (instructions not required)", async (t) => {
  const target = <button>Submit</button>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, target, {
      1: Outcomes.HasProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});

test("evaluate() passes an input with aria-describedby", async (t) => {
  const target = <input type="text" id="email" aria-describedby="email-help" />;
  const document = h.document([
    <html>
      <body>
        <label htmlFor="email">Email</label>
        <div id="email-help">Enter a valid email address</div>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, target, {
      1: Outcomes.HasProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});

test("evaluate() is inapplicable to non-form controls", async (t) => {
  const document = h.document([
    <html>
      <body>
        <div>Not a form control</div>
        <span>Also not a form control</span>
        <p>Paragraph text</p>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [inapplicable(R120)]);
});

test("evaluate() is inapplicable to hidden form controls", async (t) => {
  const document = h.document([
    <html>
      <body>
        <input type="text" hidden />
        <button hidden>Hidden button</button>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [inapplicable(R120)]);
});

test("evaluate() passes an input with role textbox", async (t) => {
  const target = <div role="textbox" contentEditable="true" aria-label="Comments"></div>;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    passed(R120, target, {
      1: Outcomes.HasProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});

test("evaluate() fails a checkbox without proper label", async (t) => {
  const target = <input type="checkbox" />;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R120, { document }), [
    failed(R120, target, {
      1: Outcomes.HasNoProperLabel,
      2: Outcomes.HasProperInstructions,
    }),
  ]);
});
