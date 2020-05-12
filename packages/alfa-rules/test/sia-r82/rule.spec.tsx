import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Document, Element } from "@siteimprove/alfa-dom";

import R82, { Outcomes } from "../../src/sia-r82/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed } from "../common/outcome";

const { isElement, hasName } = Element;
const { and } = Predicate;

const document = Document.of((self) => [
  Element.fromElement(
    <form>
      <label>
        Input
        <input type="text"></input>
      </label>
      <span>Visible error</span>
      <span hidden>Invisible error</span>
      <span aria-hidden="true">Ignored error</span>
    </form>,
    Option.of(self)
  ),
]);

const input = document
  .descendants()
  .find(and(isElement, hasName("input")))
  .get();

const [
  perceivableError,
  invisibleError,
  ignoredError,
] = document.descendants().filter(and(isElement, hasName("span")));

test("evaluate() passes when a form field has no error indicator", async (t) => {
  t.deepEqual(
    await evaluate(
      R82,
      { document },
      oracle({
        "error-indicators": [],
      })
    ),
    [
      passed(R82, input, {
        1: Outcomes.HasNoErrorIndicator,
        2: Outcomes.HasNoErrorIndicator,
      }),
    ]
  );
});

test(`evaluate() passes when a form field has an error indicator that identifies
      the form field and describes the cause of the error or how to resolve it
      `, async (t) => {
  t.deepEqual(
    await evaluate(
      R82,
      { document },
      oracle({
        "error-indicators": [perceivableError],
        "error-indicator-identifies-form-field": true,
        "error-indicator-describes-resolution": true,
      })
    ),
    [
      passed(R82, input, {
        1: Outcomes.ErrorIndicatorIdentifiesTarget,
        2: Outcomes.ErrorIndicatorDescribesResolution,
      }),
    ]
  );
});

test(`evaluate() fails when a form field has an error indicator that does not
      identify the form field and does not describe the cause of the error or
      how to resolve it`, async (t) => {
  t.deepEqual(
    await evaluate(
      R82,
      { document },
      oracle({
        "error-indicators": [perceivableError],
        "error-indicator-identifies-form-field": false,
        "error-indicator-describes-resolution": false,
      })
    ),
    [
      failed(R82, input, {
        1: Outcomes.NoErrorIndicatorIdentifiesTarget,
        2: Outcomes.NoErrorIndicatorDescribesResolution,
      }),
    ]
  );
});

test(`evaluate() fails when a form field has an error indicator that identifies
      the form field and describes the cause of the error or how to resolve it,
      but the text is hidden`, async (t) => {
  t.deepEqual(
    await evaluate(
      R82,
      { document },
      oracle({
        "error-indicators": [invisibleError],
        "error-indicator-identifies-form-field": true,
        "error-indicator-describes-resolution": true,
      })
    ),
    [
      failed(R82, input, {
        1: Outcomes.ErrorIndicatorIdentifiesTargetButIsNotPerceivable,
        2: Outcomes.ErrorIndicatorDescribesResolutionButIsNotPerceivable,
      }),
    ]
  );
});

test(`evaluate() fails when a form field has an error indicator that identifies
      the form field and describes the cause of the error or how to resolve it,
      but the text is hidden from assistive technology`, async (t) => {
  t.deepEqual(
    await evaluate(
      R82,
      { document },
      oracle({
        "error-indicators": [ignoredError],
        "error-indicator-identifies-form-field": true,
        "error-indicator-describes-resolution": true,
      })
    ),
    [
      failed(R82, input, {
        1: Outcomes.ErrorIndicatorIdentifiesTargetButIsNotPerceivable,
        2: Outcomes.ErrorIndicatorDescribesResolutionButIsNotPerceivable,
      }),
    ]
  );
});
