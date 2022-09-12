import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R60, { Outcomes } from "../../src/sia-r60/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a <div> with a role of group and a name", async (t) => {
  const target = (
    <div role="group" aria-labelledby="ssn">
      <span id="ssn">Social Security Number</span>
      <input size="3" type="text" aria-required="true" title="First 3 digits" />
      <input size="2" type="text" aria-required="true" title="Next 2 digits" />
      <input size="4" type="text" aria-required="true" title="Last 4 digits" />
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R60, { document }), [
    passed(R60, target, {
      1: Outcomes.HasAccessibleName("group"),
    }),
  ]);
});

test("evaluate() passes a <div> with a role of radiogroup and a name", async (t) => {
  const target = (
    <div role="radiogroup" aria-labelledby="question-label">
      <div id="question-label">
        On a scale from 1 to 5, how much do you like WCAG?
      </div>
      <p>
        <label>
          <input type="radio" name="answer" value="1" /> 1
        </label>
      </p>
      <p>
        <label>
          <input type="radio" name="answer" value="2" /> 2
        </label>
      </p>
      <p>
        <label>
          <input type="radio" name="answer" value="3" /> 3
        </label>
      </p>
      <p>
        <label>
          <input type="radio" name="answer" value="4" /> 4
        </label>
      </p>
      <p>
        <label>
          <input type="radio" name="answer" value="5" /> 5
        </label>
      </p>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R60, { document }), [
    passed(R60, target, {
      1: Outcomes.HasAccessibleName("radiogroup"),
    }),
  ]);
});

test("evaluate() passes a <tr> element with an inherited group role and individual group fields", async (t) => {
  const target = (
    <tr aria-labelledby="ssn">
      <th id="ssn">Social Security Number</th>
      <td>
        <input
          size="3"
          type="text"
          aria-required="true"
          title="First 3 digits"
        />
      </td>
      <td>
        <input
          size="2"
          type="text"
          aria-required="true"
          title="Next 2 digits"
        />
      </td>
      <td>
        <input
          size="4"
          type="text"
          aria-required="true"
          title="Last 4 digits"
        />
      </td>
    </tr>
  );

  const document = h.document([<table>{target}</table>]);

  t.deepEqual(await evaluate(R60, { document }), [
    passed(R60, target, {
      1: Outcomes.HasAccessibleName("row"),
    }),
  ]);
});

test("evaluate() passes innermost groups, and ignores the outermost", async (t) => {
  const target1 = (
    <div role="radiogroup" aria-labelledby="question1-label">
      <div id="question1-label">
        On a scale from 1 to 5, how much do you like WCAG?
      </div>
      <p>
        <label>
          <input type="radio" name="answer" value="1" /> 1
        </label>
      </p>
      <p>
        <label>
          <input type="radio" name="answer" value="2" /> 2
        </label>
      </p>
      <p>
        <label>
          <input type="radio" name="answer" value="3" /> 3
        </label>
      </p>
      <p>
        <label>
          <input type="radio" name="answer" value="4" /> 4
        </label>
      </p>
      <p>
        <label>
          <input type="radio" name="answer" value="5" /> 5
        </label>
      </p>
    </div>
  );

  const target2 = (
    <div role="radiogroup" aria-labelledby="question2-label">
      <div id="question2-label">How compliant to WCAG is your website?</div>
      <p>
        <label>
          <input type="radio" name="answer" value="A" /> A
        </label>
      </p>
      <p>
        <label>
          <input type="radio" name="answer" value="AA" /> AA
        </label>
      </p>
      <p>
        <label>
          <input type="radio" name="answer" value="AAA" /> AAA
        </label>
      </p>
    </div>
  );

  const document = h.document([
    <div role="group">
      {target1}
      {target2}
    </div>,
  ]);

  t.deepEqual(await evaluate(R60, { document }), [
    passed(R60, target2, {
      1: Outcomes.HasAccessibleName("radiogroup"),
    }),
    passed(R60, target1, {
      1: Outcomes.HasAccessibleName("radiogroup"),
    }),
  ]);
});

test("evaluate() fails a group element with no accessible name", async (t) => {
  const target = (
    <div role="group">
      <span id="ssn">Social Security Number</span>
      <input size="3" type="text" aria-required="true" title="First 3 digits" />
      <input size="2" type="text" aria-required="true" title="Next 2 digits" />
      <input size="4" type="text" aria-required="true" title="Last 4 digits" />
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R60, { document }), [
    failed(R60, target, {
      1: Outcomes.HasNoAccessibleName("group"),
    }),
  ]);
});

test("evaluate() is inapplicable to a group of elements with no nested form controls", async (t) => {
  const target = (
    <div role="group" aria-labelledby="ssn1">
      <span id="ssn1">Social Security#</span>
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R60, { document }), [inapplicable(R60)]);
});

test("evaluate() is inapplicable to groups with only one descendant in the accessibility tree", async (t) => {
  const target = (
    <div role="group" aria-labelledby="ssn">
      <span id="ssn">Social Security Number</span>
      <input size="3" type="text" title="First 3 digits" />
      <input size="2" type="text" aria-hidden="true" title="Next 2 digits" />
      <input size="4" type="text" aria-hidden="true" title="Last 4 digits" />
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R60, { document }), [inapplicable(R60)]);
});
