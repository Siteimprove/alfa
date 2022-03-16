import { h } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R82, { Outcomes } from "../../src/sia-r82/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed } from "../common/outcome";

const target = <input type="text" />;

const perceivableError = <span>Visible error</span>;

const invisibleError = <span hidden>Invisible error</span>;

const ignoredError = <span aria-hidden="true">Ignored error</span>;

const document = h.document([
  <form>
    <label>
      Input
      {target}
    </label>
    {perceivableError}
    {invisibleError}
    {ignoredError}
  </form>,
]);

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
      passed(R82, target, {
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
        "error-indicator-identifying-form-field": Option.of(perceivableError),
        "error-indicator-describing-resolution": Option.of(perceivableError),
      })
    ),
    [
      passed(R82, target, {
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
        "error-indicator-identifying-form-field": None,
        "error-indicator-describing-resolution": None,
      })
    ),
    [
      failed(R82, target, {
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
        "error-indicator-identifying-form-field": Option.of(invisibleError),
        "error-indicator-describing-resolution": Option.of(invisibleError),
      })
    ),
    [
      failed(R82, target, {
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
        "error-indicator-identifying-form-field": Option.of(ignoredError),
        "error-indicator-describing-resolution": Option.of(ignoredError),
      })
    ),
    [
      failed(R82, target, {
        1: Outcomes.ErrorIndicatorIdentifiesTargetButIsNotPerceivable,
        2: Outcomes.ErrorIndicatorDescribesResolutionButIsNotPerceivable,
      }),
    ]
  );
});
