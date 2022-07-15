// This file has been automatically generated based on the Accessible Name Testable statements.
// Do therefore not modify it directly! If you wish to make changes, do so in
// `scripts/name-testable-statement.js` and run `yarn generate` to rebuild this file.

import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Element, Document, h } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Name } from "../src";

const { and } = Refinement;
const { hasId, isElement } = Element;

const device = Device.standard();

function getTarget(document: Document, id: string): Element {
  return document
    .descendants()
    .find(and(isElement, hasId("test")))
    .get();
}

function getName(element: Element): string {
  return Name.from(element, device)
    .map((name) => name.value)
    .getOr("");
}

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_539}
 */
test("Name test case 539", (t) => {
  const testCase = (
    <div>
      <input type="button" aria-label="Rich" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Rich");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_540}
 */
test("Name test case 540", (t) => {
  const testCase = (
    <div>
      <div id="ID1">Rich's button</div>
      <input type="button" aria-labelledby="ID1" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Rich's button");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_541}
 */
test("Name test case 541", (t) => {
  const testCase = (
    <div>
      <div id="ID1">Rich's button</div>
      <input type="button" aria-label="bar" aria-labelledby="ID1" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Rich's button");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_543}
 */
test("Name test case 543", (t) => {
  const testCase = (
    <div>
      <input type="reset" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Reset");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_544}
 */
test("Name test case 544", (t) => {
  const testCase = (
    <div>
      <input type="button" id="test" value="foo" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_545}
 */
test("Name test case 545", (t) => {
  const testCase = (
    <div>
      <input src="baz.html" type="image" id="test" alt="foo" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_546}
 */
test("Name test case 546", (t) => {
  const testCase = (
    <div>
      <label for="test">States:</label>
      <input type="text" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "States:");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_547}
 *
 * Alfa does not implement step 2C of Accessible name computation
 * {@link https://github.com/Siteimprove/alfa/issues/305}
 */
test("Name test case 547", (t) => {
  const testCase = (
    <div>
      <label for="test">
        foo
        <input type="text" value="David" />
      </label>
      <input type="text" id="test" value="baz" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "foo David");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_548}
 *
 * Alfa incorrectly recurses into <select> when computing name from content
 * {@link https://github.com/Siteimprove/alfa/issues/1192}
 */
test("Name test case 548", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <select name="member" size="1" role="menu" tabindex="0">
          <option role="menuitem" value="beard" selected="true">
            clown
          </option>
          <option role="menuitem" value="scuba">
            rich
          </option>
        </select>
      </label>
      <input type="text" id="test" value="baz" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_549}
 *
 * Alfa does not implement step 2C of Accessible name computation
 * {@link https://github.com/Siteimprove/alfa/issues/305}
 */
test("Name test case 549", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuetext="Monday"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="text" id="test" value="baz" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "crazy Monday");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_550}
 *
 * Alfa does not implement step 2C of Accessible name computation
 * {@link https://github.com/Siteimprove/alfa/issues/305}
 */
test("Name test case 550", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="text" id="test" value="baz" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "crazy 4");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_551}
 */
test("Name test case 551", (t) => {
  const testCase = (
    <div>
      <input type="text" id="test" title="crazy" value="baz" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_552}
 *
 * Alfa does not support :before and :after pseudo-elements
 * {@link https://github.com/Siteimprove/alfa/issues/954}
 */
test("Name test case 552", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:before { content:"fancy "; }
  `}</style>
      <label for="test">fruit</label>
      <input type="text" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_553}
 *
 * Alfa does not support :before and :after pseudo-elements
 * {@link https://github.com/Siteimprove/alfa/issues/954}
 */
test("Name test case 553", (t) => {
  const testCase = (
    <div>
      <style type="text/css">{`
    [data-after]:after { content: attr(data-after); }
  `}</style>
      <label for="test" data-after="test content"></label>
      <input type="text" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "test content");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_556}
 */
test("Name test case 556", (t) => {
  const testCase = (
    <div>
      <img id="test" src="foo.jpg" aria-label="1" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "1");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_557}
 */
test("Name test case 557", (t) => {
  const testCase = (
    <div>
      <img id="test" src="foo.jpg" aria-label="1" alt="a" title="t" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "1");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_558}
 */
test("Name test case 558", (t) => {
  const testCase = (
    <div>
      <input type="text" value="peanuts" id="test" />
      <img aria-labelledby="test" src="foo.jpg" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_559}
 */
test("Name test case 559", (t) => {
  const testCase = (
    <div>
      <img id="test" aria-labelledby="test" src="foo.jpg" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_560}
 */
test("Name test case 560", (t) => {
  const testCase = (
    <div>
      <input type="text" value="peanuts" id="test" />
      <img aria-labelledby="test" aria-label="1" src="foo.jpg" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_561}
 */
test("Name test case 561", (t) => {
  const testCase = (
    <div>
      <img id="test" aria-labelledby="test" aria-label="1" src="foo.jpg" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "1");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_562}
 *
 * Alfa does not implement step 2C of Accessible name computation
 * {@link https://github.com/Siteimprove/alfa/issues/305}
 */
test("Name test case 562", (t) => {
  const testCase = (
    <div>
      <input type="text" value="peanuts" id="ID1" />
      <input type="text" value="popcorn" id="ID2" />
      <input type="text" value="apple jacks" id="ID3" />
      <img aria-labelledby="ID1 ID2 ID3" id="test" src="foo.jpg" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "peanuts popcorn apple jacks");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_563}
 *
 * Alfa does not implement step 2C of Accessible name computation
 * {@link https://github.com/Siteimprove/alfa/issues/305}
 */
test("Name test case 563", (t) => {
  const testCase = (
    <div>
      <input type="text" value="peanuts" id="ID1" />
      <img id="test" aria-label="l" aria-labelledby="test ID1" src="foo.jpg" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "l peanuts");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_564}
 *
 * Alfa does not implement step 2C of Accessible name computation
 * {@link https://github.com/Siteimprove/alfa/issues/305}
 */
test("Name test case 564", (t) => {
  const testCase = (
    <div>
      <input type="text" value="peanuts" id="ID1" />
      <input type="text" value="popcorn" id="ID2" />
      <img
        id="test"
        aria-label="l"
        aria-labelledby="test ID1 ID2"
        src="foo.jpg"
      />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "l peanuts popcorn");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_565}
 *
 * Alfa does not implement step 2C of Accessible name computation
 * {@link https://github.com/Siteimprove/alfa/issues/305}
 */
test("Name test case 565", (t) => {
  const testCase = (
    <div>
      <input type="text" value="peanuts" id="ID1" />
      <input type="text" value="popcorn" id="ID2" />
      <input type="text" value="apple jacks" id="ID3" />
      <img
        id="test"
        aria-label="l"
        aria-labelledby="test ID1 ID2 ID3"
        alt="a"
        title="t"
        src="foo.jpg"
      />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "l peanuts popcorn apple jacks");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_566}
 *
 * Alfa does not implement step 2C of Accessible name computation
 * {@link https://github.com/Siteimprove/alfa/issues/305}
 */
test("Name test case 566", (t) => {
  const testCase = (
    <div>
      <input type="text" value="peanuts" id="ID1" />
      <input type="text" value="popcorn" id="ID2" />
      <input type="text" value="apple jacks" id="ID3" />
      <img
        id="test"
        aria-label=""
        aria-labelledby="test ID1 ID2 ID3"
        alt=""
        title="t"
        src="foo.jpg"
      />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.notEqual(getName(target), "t peanuts popcorn apple jacks");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_596}
 */
test("Name test case 596", (t) => {
  const testCase = (
    <div>
      <div id="test" aria-labelledby="ID1">
        foo
      </div>
      <span id="ID1">bar</span>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "bar");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_597}
 */
test("Name test case 597", (t) => {
  const testCase = (
    <div>
      <div id="test" aria-label="Tag">
        foo
      </div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Tag");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_598}
 */
test("Name test case 598", (t) => {
  const testCase = (
    <div>
      <div id="test" aria-labelledby="ID1" aria-label="Tag">
        foo
      </div>
      <span id="ID1">bar</span>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "bar");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_599}
 */
test("Name test case 599", (t) => {
  const testCase = (
    <div>
      <div id="test" aria-labelledby="ID0 ID1" aria-label="Tag">
        foo
      </div>
      <span id="ID0">bar</span>
      <span id="ID1">baz</span>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "bar baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_600}
 */
test("Name test case 600", (t) => {
  const testCase = (
    <div>
      <div id="test">Div with text</div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_601}
 */
test("Name test case 601", (t) => {
  const testCase = (
    <div>
      <div id="test" role="button">
        foo
      </div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_602}
 */
test("Name test case 602", (t) => {
  const testCase = (
    <div>
      <div
        id="test"
        role="button"
        title="Tag"
        style={{ outline: "medium solid black", width: "2em", height: "1em" }}
      ></div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Tag");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_603}
 */
test("Name test case 603", (t) => {
  const testCase = (
    <div>
      <div id="ID1">foo</div>
      <a id="test" href="test.html" aria-labelledby="ID1">
        bar
      </a>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_604}
 */
test("Name test case 604", (t) => {
  const testCase = (
    <div>
      <a id="test" href="test.html" aria-label="Tag">
        ABC
      </a>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Tag");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_605}
 */
test("Name test case 605", (t) => {
  const testCase = (
    <div>
      <a href="test.html" id="test" aria-labelledby="ID1" aria-label="Tag">
        foo
      </a>
      <p id="ID1">bar</p>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "bar");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_606}
 */
test("Name test case 606", (t) => {
  const testCase = (
    <div>
      <a
        href="test.html"
        id="test"
        aria-labelledby="test ID1"
        aria-label="Tag"
      ></a>
      <p id="ID1">foo</p>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Tag foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_607}
 */
test("Name test case 607", (t) => {
  const testCase = (
    <div>
      <a href="test.html" id="test">
        ABC
      </a>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "ABC");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_608}
 */
test("Name test case 608", (t) => {
  const testCase = (
    <div>
      <a href="test.html" id="test" title="Tag"></a>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Tag");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_609}
 */
test("Name test case 609", (t) => {
  const testCase = (
    <div>
      <input id="test" type="text" aria-labelledby="ID1 ID2 ID3" />
      <p id="ID1">foo</p>
      <p id="ID2">bar</p>
      <p id="ID3">baz</p>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo bar baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_610}
 */
test("Name test case 610", (t) => {
  const testCase = (
    <div>
      <input
        id="test"
        type="text"
        aria-label="bar"
        aria-labelledby="ID1 test"
      />
      <div id="ID1">foo</div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo bar");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_611}
 */
test("Name test case 611", (t) => {
  const testCase = (
    <div>
      <input id="test" type="text" />
      <label for="test">foo</label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_612}
 */
test("Name test case 612", (t) => {
  const testCase = (
    <div>
      <input type="password" id="test" />
      <label for="test">foo</label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_613}
 */
test("Name test case 613", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" />
      <label for="test">foo</label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_614}
 */
test("Name test case 614", (t) => {
  const testCase = (
    <div>
      <input type="radio" id="test" />
      <label for="test">foo</label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_615}
 */
test("Name test case 615", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" />
      <label for="test">foo</label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_616}
 */
test("Name test case 616", (t) => {
  const testCase = (
    <div>
      <input type="image" id="test" />
      <label for="test">foo</label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_617}
 */
test("Name test case 617", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" />
      <label for="test">
        foo
        <input type="text" value="bar" />
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo bar baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_618}
 */
test("Name test case 618", (t) => {
  const testCase = (
    <div>
      <input type="text" id="test" />
      <label for="test">
        foo
        <input type="text" value="bar" />
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo bar baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_619}
 */
test("Name test case 619", (t) => {
  const testCase = (
    <div>
      <input type="password" id="test" />
      <label for="test">
        foo
        <input type="text" value="bar" />
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo bar baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_620}
 */
test("Name test case 620", (t) => {
  const testCase = (
    <div>
      <input type="radio" id="test" />
      <label for="test">
        foo
        <input type="text" value="bar" />
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo bar baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_621}
 */
test("Name test case 621", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" />
      <label for="test">
        foo <input type="text" value="bar" /> baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo bar baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_659}
 */
test("Name test case 659", (t) => {
  const testCase = (
    <div>
      <style type="text/css">{`
    label:before { content: "foo"; }
    label:after { content: "baz"; }
  `}</style>
      <form>
        <label for="test" title="bar">
          <input id="test" type="text" name="test" title="buz" />
        </label>
      </form>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo bar baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_660}
 */
test("Name test case 660", (t) => {
  const testCase = (
    <div>
      <style type="text/css">{`
    label:before { content: "foo"; }
    label:after { content: "baz"; }
  `}</style>
      <form>
        <label for="test" title="bar">
          <input id="test" type="password" name="test" title="buz" />
        </label>
      </form>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo bar baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_661}
 */
test("Name test case 661", (t) => {
  const testCase = (
    <div>
      <style type="text/css">{`
    label:before { content: "foo"; }
    label:after { content: "baz"; }
  `}</style>
      <form>
        <label for="test">
          <input id="test" type="checkbox" name="test" title=" bar " />
        </label>
      </form>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_662}
 */
test("Name test case 662", (t) => {
  const testCase = (
    <div>
      <style type="text/css">{`
    label:before { content: "foo"; }
    label:after { content: "baz"; }
  `}</style>
      <form>
        <label for="test">
          <input id="test" type="radio" name="test" title=" bar " />
        </label>
      </form>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_663_.28DO_NOT_USE.29}
 */
test("Name test case 663 (DO NOT USE)", (t) => {
  const testCase = (
    <div>
      <style type="text/css">{`
    label:before { content: "foo"; }
    label:after { content: "baz"; }
  `}</style>
      <form>
        <label for="test">
          <input id="test" type="file" name="test" title="bar" />
        </label>
      </form>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_663a}
 */
test("Name test case 663a", (t) => {
  const testCase = (
    <div>
      <style type="text/css">{`
    label:before { content: "foo"; }
    label:after { content: "baz"; }
  `}</style>
      <form>
        <label for="test">
          <input id="test" type="image" src="foo.jpg" name="test" title="bar" />
        </label>
      </form>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_721}
 */
test("Name test case 721", (t) => {
  const testCase = (
    <div>
      <label for="test">States:</label>
      <input type="password" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "States:");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_723}
 */
test("Name test case 723", (t) => {
  const testCase = (
    <div>
      <label for="test">States:</label>
      <input type="checkbox" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "States:");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_724}
 */
test("Name test case 724", (t) => {
  const testCase = (
    <div>
      <label for="test">States:</label>
      <input type="radio" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "States:");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_725}
 */
test("Name test case 725", (t) => {
  const testCase = (
    <div>
      <label for="test">File:</label>
      <input type="file" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "File:");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_726}
 */
test("Name test case 726", (t) => {
  const testCase = (
    <div>
      <label for="test">States:</label>
      <input type="image" id="test" src="foo.jpg" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "States:");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_727}
 */
test("Name test case 727", (t) => {
  const testCase = (
    <div>
      <label for="test">
        foo
        <input type="text" value="David" />
      </label>
      <input type="password" id="test" value="baz" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo David");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_728}
 */
test("Name test case 728", (t) => {
  const testCase = (
    <div>
      <label for="test">
        foo
        <input type="text" value="David" />
      </label>
      <input type="checkbox" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo David");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_729}
 */
test("Name test case 729", (t) => {
  const testCase = (
    <div>
      <label for="test">
        foo
        <input type="text" value="David" />
      </label>
      <input type="radio" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo David");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_730}
 */
test("Name test case 730", (t) => {
  const testCase = (
    <div>
      <label for="test">
        foo
        <input type="text" value="David" />
      </label>
      <input type="file" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo David");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_731}
 */
test("Name test case 731", (t) => {
  const testCase = (
    <div>
      <label for="test">
        foo
        <input type="text" value="David" />
      </label>
      <input type="image" id="test" src="foo.jpg" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo David");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_733}
 */
test("Name test case 733", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <select name="member" size="1" role="menu" tabindex="0">
          <option role="menuitem" value="beard" selected="true">
            clown
          </option>
          <option role="menuitem" value="scuba">
            rich
          </option>
        </select>
      </label>
      <input type="password" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_734}
 */
test("Name test case 734", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <select name="member" size="1" role="menu" tabindex="0">
          <option role="menuitem" value="beard" selected="true">
            clown
          </option>
          <option role="menuitem" value="scuba">
            rich
          </option>
        </select>
      </label>
      <input type="checkbox" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_735}
 */
test("Name test case 735", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <select name="member" size="1" role="menu" tabindex="0">
          <option role="menuitem" value="beard" selected="true">
            clown
          </option>
          <option role="menuitem" value="scuba">
            rich
          </option>
        </select>
      </label>
      <input type="radio" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_736}
 */
test("Name test case 736", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <select name="member" size="1" role="menu" tabindex="0">
          <option role="menuitem" value="beard" selected="true">
            clown
          </option>
          <option role="menuitem" value="scuba">
            rich
          </option>
        </select>
      </label>
      <input type="file" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_737}
 */
test("Name test case 737", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <select name="member" size="1" role="menu" tabindex="0">
          <option role="menuitem" value="beard" selected="true">
            clown
          </option>
          <option role="menuitem" value="scuba">
            rich
          </option>
        </select>
      </label>
      <input type="image" id="test" src="foo.jpg" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_738}
 */
test("Name test case 738", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuetext="Monday"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="password" value="baz" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy Monday");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_739}
 */
test("Name test case 739", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuetext="Monday"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="checkbox" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy Monday");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_740}
 */
test("Name test case 740", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuetext="Monday"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="radio" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy Monday");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_741}
 */
test("Name test case 741", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuetext="Monday"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="file" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy Monday");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_742}
 */
test("Name test case 742", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuetext="Monday"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="image" src="foo.jpg" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy Monday");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_743}
 */
test("Name test case 743", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="password" id="test" value="baz" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy 4");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_744}
 */
test("Name test case 744", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="checkbox" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy 4");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_745}
 */
test("Name test case 745", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="radio" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy 4");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_746}
 */
test("Name test case 746", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="file" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy 4");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_747}
 */
test("Name test case 747", (t) => {
  const testCase = (
    <div>
      <label for="test">
        crazy
        <div
          role="spinbutton"
          aria-valuemin="1"
          aria-valuemax="7"
          aria-valuenow="4"
        ></div>
      </label>
      <input type="image" src="foo.jpg" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy 4");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_748}
 */
test("Name test case 748", (t) => {
  const testCase = (
    <div>
      <input type="password" id="test" title="crazy" value="baz" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_749}
 */
test("Name test case 749", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" title="crazy" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_750}
 */
test("Name test case 750", (t) => {
  const testCase = (
    <div>
      <input type="radio" id="test" title="crazy" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_751}
 */
test("Name test case 751", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" title="crazy" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_752}
 */
test("Name test case 752", (t) => {
  const testCase = (
    <div>
      <input type="image" src="foo.jpg" id="test" title="crazy" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "crazy");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_753}
 */
test("Name test case 753", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:before { content:"fancy "; }
  `}</style>
      <label for="test">fruit</label>
      <input type="password" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_754}
 */
test("Name test case 754", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:before { content:"fancy "; }
  `}</style>
      <label for="test">fruit</label>
      <input type="checkbox" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_755}
 */
test("Name test case 755", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:before { content:"fancy "; }
  `}</style>
      <label for="test">fruit</label>
      <input type="radio" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_756}
 */
test("Name test case 756", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:before { content:"fancy "; }
  `}</style>
      <label for="test">fruit</label>
      <input type="file" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_757}
 */
test("Name test case 757", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:before { content:"fancy "; }
  `}</style>
      <label for="test">fruit</label>
      <input type="image" src="foo.jpg" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_758}
 */
test("Name test case 758", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:after { content:" fruit"; }
  `}</style>
      <label for="test">fancy</label>
      <input type="password" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_759}
 */
test("Name test case 759", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:after { content:" fruit"; }
  `}</style>
      <label for="test">fancy</label>
      <input type="checkbox" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_760}
 */
test("Name test case 760", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:after { content:" fruit"; }
  `}</style>
      <label for="test">fancy</label>
      <input type="radio" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_761}
 */
test("Name test case 761", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:after { content:" fruit"; }
  `}</style>
      <label for="test">fancy</label>
      <input type="file" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_test_case_762}
 */
test("Name test case 762", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:after { content:" fruit"; }
  `}</style>
      <label for="test">fancy</label>
      <input type="image" src="foo.jpg" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "fancy fruit");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_checkbox-label-embedded-combobox}
 */
test("Name checkbox-label-embedded-combobox", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" />
      <label for="test">
        Flash the screen
        <div role="combobox">
          <div role="textbox"></div>
          <ul role="listbox" style={{ listStyleType: "none" }}>
            <li role="option" aria-selected="true">
              1
            </li>
            <li role="option">2</li>
            <li role="option">3</li>
          </ul>
        </div>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_checkbox-label-embedded-menu}
 */
test("Name checkbox-label-embedded-menu", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" />
      <label for="test">
        Flash the screen
        <span role="menu">
          <span role="menuitem" aria-selected="true">
            1
          </span>
          <span role="menuitem" hidden>
            2
          </span>
          <span role="menuitem" hidden>
            3
          </span>
        </span>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_checkbox-label-embedded-select}
 */
test("Name checkbox-label-embedded-select", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" />
      <label for="test">
        Flash the screen
        <select size="1">
          <option selected="selected">1</option>
          <option>2</option>
          <option>3</option>
        </select>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_checkbox-label-embedded-slider}
 */
test("Name checkbox-label-embedded-slider", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" />
      <label for="test">
        foo{" "}
        <input
          role="slider"
          type="range"
          value="5"
          min="1"
          max="10"
          aria-valuenow="5"
          aria-valuemin="1"
          aria-valuemax="10"
        />{" "}
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo 5 baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_checkbox-label-embedded-spinbutton}
 */
test("Name checkbox-label-embedded-spinbutton", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" />
      <label for="test">
        foo{" "}
        <input
          role="spinbutton"
          type="number"
          value="5"
          min="1"
          max="10"
          aria-valuenow="5"
          aria-valuemin="1"
          aria-valuemax="10"
        />{" "}
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo 5 baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_checkbox-title}
 */
test("Name checkbox-title", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" title="foo" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-label-embedded-combobox}
 */
test("Name file-label-embedded-combobox", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" />
      <label for="test">
        Flash the screen
        <div role="combobox">
          <div role="textbox"></div>
          <ul role="listbox" style={{ listStyleType: "none" }}>
            <li role="option" aria-selected="true">
              1{" "}
            </li>
            <li role="option">2 </li>
            <li role="option">3 </li>
          </ul>
        </div>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-label-embedded-menu}
 */
test("Name file-label-embedded-menu", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" />
      <label for="test">
        Flash the screen
        <span role="menu">
          <span role="menuitem" aria-selected="true">
            1
          </span>
          <span role="menuitem" hidden>
            2
          </span>
          <span role="menuitem" hidden>
            3
          </span>
        </span>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-label-embedded-select}
 */
test("Name file-label-embedded-select", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" />
      <label for="test">
        Flash the screen
        <select size="1">
          <option selected="selected">1</option>
          <option>2</option>
          <option>3</option>
        </select>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-label-embedded-slider}
 */
test("Name file-label-embedded-slider", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" />
      <label for="test">
        foo{" "}
        <input
          role="slider"
          type="range"
          value="5"
          min="1"
          max="10"
          aria-valuenow="5"
          aria-valuemin="1"
          aria-valuemax="10"
        />{" "}
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo 5 baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-label-embedded-spinbutton}
 */
test("Name file-label-embedded-spinbutton", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" />
      <label for="test">
        foo{" "}
        <input
          role="spinbutton"
          type="number"
          value="5"
          min="1"
          max="10"
          aria-valuenow="5"
          aria-valuemin="1"
          aria-valuemax="10"
        />{" "}
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo 5 baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-title}
 */
test("Name file-title", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" title="foo" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_image-title}
 */
test("Name image-title", (t) => {
  const testCase = (
    <div>
      <input type="image" src="test.png" id="test" title="foo" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_password-label-embedded-combobox}
 */
test("Name password-label-embedded-combobox", (t) => {
  const testCase = (
    <div>
      <input type="password" id="test" />
      <label for="test">
        Flash the screen
        <div role="combobox">
          <div role="textbox"></div>
          <ul role="listbox" style={{ listStyleType: "none" }}>
            <li role="option" aria-selected="true">
              1
            </li>
            <li role="option">2</li>
            <li role="option">3</li>
          </ul>
        </div>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_password-label-embedded-menu}
 */
test("Name password-label-embedded-menu", (t) => {
  const testCase = (
    <div>
      <input type="password" id="test" />
      <label for="test">
        Flash the screen
        <span role="menu">
          <span role="menuitem" aria-selected="true">
            1
          </span>
          <span role="menuitem" hidden>
            2
          </span>
          <span role="menuitem" hidden>
            3
          </span>
        </span>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_password-label-embedded-select}
 */
test("Name password-label-embedded-select", (t) => {
  const testCase = (
    <div>
      <input type="password" id="test" />
      <label for="test">
        Flash the screen
        <select size="1">
          <option selected="selected">1</option>
          <option>2</option>
          <option>3</option>
        </select>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_password-label-embedded-slider}
 */
test("Name password-label-embedded-slider", (t) => {
  const testCase = (
    <div>
      <input type="password" id="test" />
      <label for="test">
        foo{" "}
        <input
          role="slider"
          type="range"
          value="5"
          min="1"
          max="10"
          aria-valuenow="5"
          aria-valuemin="1"
          aria-valuemax="10"
        />{" "}
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo 5 baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_password-label-embedded-spinbutton}
 */
test("Name password-label-embedded-spinbutton", (t) => {
  const testCase = (
    <div>
      <input type="password" id="test" />
      <label for="test">
        foo{" "}
        <input
          role="spinbutton"
          type="number"
          value="5"
          min="1"
          max="10"
          aria-valuenow="5"
          aria-valuemin="1"
          aria-valuemax="10"
        />{" "}
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo 5 baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_password-title}
 */
test("Name password-title", (t) => {
  const testCase = (
    <div>
      <input type="password" id="test" title="foo" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_radio-label-embedded-combobox}
 */
test("Name radio-label-embedded-combobox", (t) => {
  const testCase = (
    <div>
      <input type="radio" id="test" />
      <label for="test">
        Flash the screen
        <div role="combobox">
          <div role="textbox"></div>
          <ul role="listbox" style={{ listStyleType: "none" }}>
            <li role="option" aria-selected="true">
              1
            </li>
            <li role="option">2</li>
            <li role="option">3</li>
          </ul>
        </div>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_radio-label-embedded-menu}
 */
test("Name radio-label-embedded-menu", (t) => {
  const testCase = (
    <div>
      <input type="radio" id="test" />
      <label for="test">
        Flash the screen
        <span role="menu">
          <span role="menuitem" aria-selected="true">
            1
          </span>
          <span role="menuitem" hidden>
            2
          </span>
          <span role="menuitem" hidden>
            3
          </span>
        </span>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_radio-label-embedded-select}
 */
test("Name radio-label-embedded-select", (t) => {
  const testCase = (
    <div>
      <input type="radio" id="test" />
      <label for="test">
        Flash the screen
        <select size="1">
          <option selected="selected">1</option>
          <option>2</option>
          <option>3</option>
        </select>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_radio-label-embedded-slider}
 */
test("Name radio-label-embedded-slider", (t) => {
  const testCase = (
    <div>
      <input type="radio" id="test" />
      <label for="test">
        foo{" "}
        <input
          role="slider"
          type="range"
          value="5"
          min="1"
          max="10"
          aria-valuenow="5"
          aria-valuemin="1"
          aria-valuemax="10"
        />{" "}
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo 5 baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_radio-label-embedded-spinbutton}
 */
test("Name radio-label-embedded-spinbutton", (t) => {
  const testCase = (
    <div>
      <input type="radio" id="test" />
      <label for="test">
        foo{" "}
        <input
          role="spinbutton"
          type="number"
          value="5"
          min="1"
          max="10"
          aria-valuenow="5"
          aria-valuemin="1"
          aria-valuemax="10"
        />{" "}
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo 5 baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_radio-title}
 */
test("Name radio-title", (t) => {
  const testCase = (
    <div>
      <input type="radio" id="test" title="foo" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_text-label-embedded-combobox}
 */
test("Name text-label-embedded-combobox", (t) => {
  const testCase = (
    <div>
      <input type="text" id="test" />
      <label for="test">
        Flash the screen
        <div role="combobox">
          <div role="textbox"></div>
          <ul role="listbox" style={{ listStyleType: "none" }}>
            <li role="option" aria-selected="true">
              1
            </li>
            <li role="option">2</li>
            <li role="option">3</li>
          </ul>
        </div>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_text-label-embedded-menu}
 */
test("Name text-label-embedded-menu", (t) => {
  const testCase = (
    <div>
      <input type="text" id="test" />
      <label for="test">
        Flash the screen
        <span role="menu">
          <span role="menuitem" aria-selected="true">
            1
          </span>
          <span role="menuitem" hidden>
            2
          </span>
          <span role="menuitem" hidden>
            3
          </span>
        </span>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_text-label-embedded-select}
 */
test("Name text-label-embedded-select", (t) => {
  const testCase = (
    <div>
      <input type="text" id="test" />
      <label for="test">
        Flash the screen
        <select size="1">
          <option selected="selected">1</option>
          <option>2</option>
          <option>3</option>
        </select>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_text-label-embedded-slider}
 */
test("Name text-label-embedded-slider", (t) => {
  const testCase = (
    <div>
      <input type="text" id="test" />
      <label for="test">
        foo{" "}
        <input
          role="slider"
          type="range"
          value="5"
          min="1"
          max="10"
          aria-valuenow="5"
          aria-valuemin="1"
          aria-valuemax="10"
        />{" "}
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo 5 baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_text-label-embedded-spinbutton}
 */
test("Name text-label-embedded-spinbutton", (t) => {
  const testCase = (
    <div>
      <input type="text" id="test" />
      <label for="test">
        foo{" "}
        <input
          role="spinbutton"
          type="number"
          value="5"
          min="1"
          max="10"
          aria-valuenow="5"
          aria-valuemin="1"
          aria-valuemax="10"
        />{" "}
        baz
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo 5 baz");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_text-title}
 */
test("Name text-title", (t) => {
  const testCase = (
    <div>
      <input type="text" id="test" title="foo" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "foo");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_from_content}
 */
test("Name from content", (t) => {
  const testCase = (
    <div>
      <style>{`
    .hidden { display: none; }
  `}</style>
      <div id="test" role="link" tabindex="0">
        <span aria-hidden="true">
          <i> Hello, </i>
        </span>
        <span>My</span> name is
        <div>
          <img src="file.jpg" title="Bryan" alt="" role="presentation" />
        </div>
        <span role="presentation" aria-label="Eli">
          <span aria-label="Garaventa">Zambino</span>
        </span>
        <span>the weird.</span>
        (QED)
        <span class="hidden">
          <i>
            <b>and don't you forget it.</b>
          </i>
        </span>
        <table>
          <tr>
            <td>Where</td>
            <td style={{ visibility: "hidden" }}>
              <div>in</div>
            </td>
            <td>
              <div style={{ display: "none" }}>the world</div>
            </td>
            <td>are my marbles?</td>
          </tr>
        </table>
      </div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(
    getName(target),
    "My name is Eli the weird. (QED) Where are my marbles?"
  );
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_from_content_of_labelledby_element}
 */
test("Name from content of labelledby element", (t) => {
  const testCase = (
    <div>
      <style>{`
    .hidden { display: none; }
  `}</style>
      <input id="test" type="text" aria-labelledby="lblId" />
      <div id="lblId">
        <span aria-hidden="true">
          <i> Hello, </i>
        </span>
        <span>My</span> name is
        <div>
          <img src="file.jpg" title="Bryan" alt="" role="presentation" />
        </div>
        <span role="presentation" aria-label="Eli">
          <span aria-label="Garaventa">Zambino</span>
        </span>
        <span>the weird.</span>
        (QED)
        <span class="hidden">
          <i>
            <b>and don't you forget it.</b>
          </i>
        </span>
        <table>
          <tr>
            <td>Where</td>
            <td style={{ visibility: "hidden" }}>
              <div>in</div>
            </td>
            <td>
              <div style={{ display: "none" }}>the world</div>
            </td>
            <td>are my marbles?</td>
          </tr>
        </table>
      </div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(
    getName(target),
    "My name is Eli the weird. (QED) Where are my marbles?"
  );
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_from_content_of_label}
 */
test("Name from content of label", (t) => {
  const testCase = (
    <div>
      <style>{`
    .hidden { display: none; }
  `}</style>
      <input type="text" id="test" />
      <label for="test" id="label">
        <span aria-hidden="true">
          <i> Hello, </i>
        </span>
        <span>My</span> name is
        <div>
          <img src="file.jpg" title="Bryan" alt="" role="presentation" />
        </div>
        <span role="presentation" aria-label="Eli">
          <span aria-label="Garaventa">Zambino</span>
        </span>
        <span>the weird.</span>
        (QED)
        <span class="hidden">
          <i>
            <b>and don't you forget it.</b>
          </i>
        </span>
        <table>
          <tr>
            <td>Where</td>
            <td style={{ visibility: "hidden" }}>
              <div>in</div>
            </td>
            <td>
              <div style={{ display: "none" }}>the world</div>
            </td>
            <td>are my marbles?</td>
          </tr>
        </table>
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(
    getName(target),
    "My name is Eli the weird. (QED) Where are my marbles?"
  );
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_from_content_of_labelledby_elements_one_of_which_is_hidden}
 */
test("Name from content of labelledby elements one of which is hidden", (t) => {
  const testCase = (
    <div>
      <style>{`
    .hidden { display: none; }
  `}</style>
      <div>
        <input
          id="test"
          type="text"
          aria-labelledby="lbl1 lbl2"
          aria-describedby="descId"
        />
        <span>
          <span aria-hidden="true" id="lbl1">
            Important
          </span>
          <span class="hidden">
            <span aria-hidden="true" id="lbl2">
              stuff
            </span>
          </span>
        </span>
      </div>
      <div class="hidden">
        <div id="descId">
          <span aria-hidden="true">
            <i> Hello, </i>
          </span>
          <span>My</span> name is
          <div>
            <img src="file.jpg" title="Bryan" alt="" role="presentation" />
          </div>
          <span role="presentation" aria-label="Eli">
            <span aria-label="Garaventa">Zambino</span>
          </span>
          <span>the weird.</span>
          (QED)
          <span class="hidden">
            <i>
              <b>and don't you forget it.</b>
            </i>
          </span>
          <table>
            <tr>
              <td>Where</td>
              <td style={{ visibility: "hidden" }}>
                <div>in</div>
              </td>
              <td>
                <div style={{ display: "none" }}>the world</div>
              </td>
              <td>are my marbles?</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Important stuff");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_1.0_combobox-focusable-alternative}
 */
test("Name 1.0 combobox-focusable-alternative", (t) => {
  const testCase = (
    <div>
      <input
        id="test"
        role="combobox"
        type="text"
        title="Choose your language"
        value="English"
      />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Choose your language");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_1.0_combobox-focusable}
 */
test("Name 1.0 combobox-focusable", (t) => {
  const testCase = (
    <div>
      <div id="test" role="combobox" tabindex="0" title="Choose your language.">
        <span> English </span>
      </div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Choose your language.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_checkbox-label-embedded-listbox}
 */
test("Name checkbox-label-embedded-listbox", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" />
      <label for="test">
        Flash the screen
        <ul role="listbox" style={{ listStyleType: "none" }}>
          <li role="option" aria-selected="true">
            1
          </li>
          <li role="option">2</li>
          <li role="option">3</li>
        </ul>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_checkbox-label-embedded-textbox}
 */
test("Name checkbox-label-embedded-textbox", (t) => {
  const testCase = (
    <div>
      <input type="checkbox" id="test" />
      <label for="test">
        Flash the screen
        <div role="textbox" contenteditable>
          1
        </div>
        times.
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_checkbox-label-multiple-label-alternative}
 */
test("Name checkbox-label-multiple-label-alternative", (t) => {
  const testCase = (
    <div>
      <label for="test">a test</label>
      <label>
        This <input type="checkbox" id="test" /> is
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "a test This is");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_checkbox-label-multiple-label}
 */
test("Name checkbox-label-multiple-label", (t) => {
  const testCase = (
    <div>
      <label>
        This <input type="checkbox" id="test" /> is
      </label>
      <label for="test">a test</label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "This is a test");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-label-inline-block-elements}
 */
test("Name file-label-inline-block-elements", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" />
      <label for="test">
        W
        <i>
          h<b>a</b>
        </i>
        t<br />
        is
        <div>
          your
          <div>
            name<b>?</b>
          </div>
        </div>
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "What is your name?");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-label-inline-block-styles}
 */
test("Name file-label-inline-block-styles", (t) => {
  const testCase = (
    <div>
      <style>{`
    label:before { content: "This"; display: block; }
    label:after { content: "."; }
  `}</style>
      <label for="test">is a test</label>
      <input type="text" id="test" />
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "This is a test.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-label-inline-hidden-elements}
 */
test("Name file-label-inline-hidden-elements", (t) => {
  const testCase = (
    <div>
      <style>{`
    .hidden { display: none; }
  `}</style>
      <input type="file" id="test" />
      <label for="test">
        <span class="hidden">1</span>
        <span>2</span>
        <span style={{ visibility: "hidden" }}>3</span>
        <span>4</span>
        <span hidden>5</span>
        <span>6</span>
        <span aria-hidden="true">7</span>
        <span>8</span>
        <span aria-hidden="false" class="hidden">
          9
        </span>
        <span>10</span>
      </label>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "2 4 6 8 10");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-label-owned-combobox-owned-listbox}
 */
test("Name file-label-owned-combobox-owned-listbox", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" />
      <label for="test">
        Flash <span aria-owns="id1">the screen</span> times.
      </label>
      <div>
        <div id="id1" role="combobox" aria-owns="id2">
          <div role="textbox"></div>
        </div>
      </div>
      <div>
        <ul id="id2" role="listbox" style={{ listStyleType: "none" }}>
          <li role="option">1 </li>
          <li role="option" aria-selected="true">
            2{" "}
          </li>
          <li role="option">3 </li>
        </ul>
      </div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 2 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_file-label-owned-combobox}
 */
test("Name file-label-owned-combobox", (t) => {
  const testCase = (
    <div>
      <input type="file" id="test" />
      <label for="test">
        Flash <span aria-owns="id1">the screen</span> times.
      </label>
      <div id="id1">
        <div role="combobox">
          <div role="textbox"></div>
          <ul role="listbox" style={{ listStyleType: "none" }}>
            <li role="option" aria-selected="true">
              1{" "}
            </li>
            <li role="option">2 </li>
            <li role="option">3 </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Flash the screen 1 times.");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_link-mixed-content}
 */
test("Name link-mixed-content", (t) => {
  const testCase = (
    <div>
      <style>{`
    .hidden { display: none; }
  `}</style>
      <div id="test" role="link" tabindex="0">
        <span aria-hidden="true">
          <i> Hello, </i>
        </span>
        <span>My</span> name is
        <div>
          <img src="file.jpg" title="Bryan" alt="" role="presentation" />
        </div>
        <span role="presentation" aria-label="Eli">
          <span aria-label="Garaventa">Zambino</span>
        </span>
        <span>the weird.</span>
        (QED)
        <span class="hidden">
          <i>
            <b>and don't you forget it.</b>
          </i>
        </span>
      </div>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "My name is Eli the weird. (QED)");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_link-with-label}
 */
test("Name link-with-label", (t) => {
  const testCase = (
    <div>
      <a id="test" href="#" aria-label="California" title="San Francisco">
        United States
      </a>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "California");
});

/**
 * {@link https://www.w3.org/wiki/AccName_1.1_Testable_Statements#Name_heading-combobox-focusable-alternative}
 */
test("Name heading-combobox-focusable-alternative", (t) => {
  const testCase = (
    <div>
      <h2 id="test">
        Country of origin:
        <input
          role="combobox"
          type="text"
          title="Choose your country."
          value="United States"
        />
      </h2>
    </div>
  );

  const document = h.document([testCase]);

  const target = getTarget(document, "test");

  t.equal(getName(target), "Country of origin: United States");
});
