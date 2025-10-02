import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R121, { Outcomes } from "../../dist/sia-r121/rule.js";

import { evaluate } from "../common/evaluate.js";
import { passed, failed, inapplicable } from "../common/outcome.js";

test("evaluate() passes a form control with proper error identification", async (t) => {
  const target = <input type="text" aria-invalid="true" aria-errormessage="username-error" />;
  const document = h.document([
    <html>
      <body>
        {target}
        <div id="username-error">Username is required</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasErrorIdentification,
      2: Outcomes.HasErrorDescription,
      3: Outcomes.HasErrorSuggestion,
    }),
  ]);
});

test("evaluate() fails a form control without error identification", async (t) => {
  const target = <input type="text" />;
  const document = h.document([
    <html>
      <body>
        {target}
        <div>Username is required</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    failed(R121, target, {
      1: Outcomes.HasNoErrorIdentification,
      2: Outcomes.HasNoErrorDescription,
      3: Outcomes.HasNoErrorSuggestion,
    }),
  ]);
});

test("evaluate() passes a form control with aria-invalid", async (t) => {
  const target = <input type="email" aria-invalid="true" />;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasErrorIdentification,
      2: Outcomes.HasNoErrorDescription,
      3: Outcomes.HasNoErrorSuggestion,
    }),
  ]);
});

test("evaluate() passes a form control with error class", async (t) => {
  const target = <input type="text" className="error" />;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasErrorIdentification,
      2: Outcomes.HasNoErrorDescription,
      3: Outcomes.HasNoErrorSuggestion,
    }),
  ]);
});

test("evaluate() passes a form control with aria-describedby error message", async (t) => {
  const target = <input type="text" aria-describedby="error-msg" />;
  const document = h.document([
    <html>
      <body>
        {target}
        <div id="error-msg">This field is required</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasNoErrorIdentification,
      2: Outcomes.HasErrorDescription,
      3: Outcomes.HasNoErrorSuggestion,
    }),
  ]);
});

test("evaluate() passes a form control with error suggestion", async (t) => {
  const target = <input type="email" aria-invalid="true" aria-describedby="email-help" />;
  const document = h.document([
    <html>
      <body>
        {target}
        <div id="email-help">Please enter a valid email address</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasErrorIdentification,
      2: Outcomes.HasErrorDescription,
      3: Outcomes.HasErrorSuggestion,
    }),
  ]);
});

test("evaluate() passes a form control with nearby error message", async (t) => {
  const target = <input type="text" />;
  const document = h.document([
    <html>
      <body>
        {target}
        <div>Error: This field is required</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasNoErrorIdentification,
      2: Outcomes.HasErrorDescription,
      3: Outcomes.HasNoErrorSuggestion,
    }),
  ]);
});

test("evaluate() passes a form control with data-error attribute", async (t) => {
  const target = <input type="text" data-error="true" />;
  const document = h.document([
    <html>
      <body>
        {target}
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasErrorIdentification,
      2: Outcomes.HasNoErrorDescription,
      3: Outcomes.HasNoErrorSuggestion,
    }),
  ]);
});

test("evaluate() passes a form control with aria-errormessage", async (t) => {
  const target = <input type="text" aria-errormessage="field-error" />;
  const document = h.document([
    <html>
      <body>
        {target}
        <div id="field-error">Invalid input</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasErrorIdentification,
      2: Outcomes.HasErrorDescription,
      3: Outcomes.HasNoErrorSuggestion,
    }),
  ]);
});

test("evaluate() passes a textarea with comprehensive error handling", async (t) => {
  const target = <textarea aria-invalid="true" aria-describedby="textarea-error" />;
  const document = h.document([
    <html>
      <body>
        {target}
        <div id="textarea-error">Please enter at least 10 characters</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasErrorIdentification,
      2: Outcomes.HasErrorDescription,
      3: Outcomes.HasErrorSuggestion,
    }),
  ]);
});

test("evaluate() passes a select with error class and suggestion", async (t) => {
  const target = <select className="invalid" aria-describedby="select-help">
    <option value="">Choose an option</option>
    <option value="1">Option 1</option>
  </select>;
  
  const document = h.document([
    <html>
      <body>
        {target}
        <div id="select-help">Please select a valid option</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasErrorIdentification,
      2: Outcomes.HasErrorDescription,
      3: Outcomes.HasErrorSuggestion,
    }),
  ]);
});

test("evaluate() is inapplicable to form controls without errors", async (t) => {
  const document = h.document([
    <html>
      <body>
        <input type="text" />
        <button>Submit</button>
        <select>
          <option>Option 1</option>
        </select>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [inapplicable(R121)]);
});

test("evaluate() is inapplicable to non-form controls", async (t) => {
  const document = h.document([
    <html>
      <body>
        <div>Not a form control</div>
        <span>Also not a form control</span>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [inapplicable(R121)]);
});

test("evaluate() passes a form control with multiple error indicators", async (t) => {
  const target = <input type="text" aria-invalid="true" className="error" aria-describedby="multi-error" />;
  const document = h.document([
    <html>
      <body>
        {target}
        <div id="multi-error">Try entering a valid username</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R121, { document }), [
    passed(R121, target, {
      1: Outcomes.HasErrorIdentification,
      2: Outcomes.HasErrorDescription,
      3: Outcomes.HasErrorSuggestion,
    }),
  ]);
});
