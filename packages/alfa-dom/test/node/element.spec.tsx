import { Array } from "@siteimprove/alfa-array";
import { test } from "@siteimprove/alfa-test";

import { type Element, h } from "../../dist/index.js";

test("#tabIndex() returns the tab index explicitly assigned to an element", (t) => {
  t.equal((<div tabindex="42" />).tabIndex().getUnsafe(), 42);
});

test("#tabIndex() ignores characters after the first non-digit", (t) => {
  t.equal((<div tabindex="-1-toRemove" />).tabIndex().getUnsafe(), -1);
});

test("#tabIndex() returns 0 for an <a> element with an href attribute", (t) => {
  t.equal((<a href="#" />).tabIndex().getUnsafe(), 0);
});

test("#tabIndex() returns None for an <a> element without an href attribute", (t) => {
  t.equal((<a />).tabIndex().isNone(), true);
});

test("#tabIndex() returns None for a <div> element with tabindex null", (t) => {
  t.equal((<div tabindex="null" />).tabIndex().isNone(), true);
});

test("#tabIndex() returns 0 for a <button> element", (t) => {
  t.equal((<button />).tabIndex().getUnsafe(), 0);
});

test(`#tabIndex() returns 0 for a <summary> element that is the first <summary>
      child element of a <details> element`, (t) => {
  const summary = <summary />;

  <details>{summary}</details>;

  t.equal(summary.tabIndex().getUnsafe(), 0);
});

test(`#tabIndex() returns None for a <summary> element that is not the child of
      a <details> elements`, (t) => {
  t.equal((<summary />).tabIndex().isNone(), true);
});

test(`#tabIndex() returns None for a <summary> element that is not the first
      <summary> child element of a <details> elements`, (t) => {
  const summary = <summary />;

  <details>
    <summary />
    {summary}
  </details>;

  t.equal(summary.tabIndex().isNone(), true);
});

test("#inputType() returns the explicit type of an <input> element", (t) => {
  for (const type of [
    "hidden",
    "search",
    "tel",
    "url",
    "email",
    "password",
    "date",
    "month",
    "week",
    "time",
    "datetime-local",
    "number",
    "range",
    "color",
    "checkbox",
    "radio",
    "file",
    "submit",
    "image",
    "reset",
    "button",
    "text",
  ] as const) {
    t.equal(((<input type={type} />) as Element<"input">).inputType(), type);
  }
});

test("#inputType() returns 'text' for an <input> element without a type attribute", (t) => {
  t.equal(((<input />) as Element<"input">).inputType(), "text");
});

test("#inputType() returns 'text' for an <input> element with an invalid type attribute", (t) => {
  // We cannot use JSX to create an <input> element with an invalid type attribute
  t.equal(
    h.element("input", [h.attribute("type", "invalid")]).inputType(),
    "text",
  );
});

test("#displaySize() returns 1 for non-multiple <select> without a size attribute", (t) => {
  t.equal(((<select />) as Element<"select">).displaySize(), 1);
});

test("#displaySize() returns the size attribute for a non-multiple <select>", (t) => {
  t.equal(((<select size="42" />) as Element<"select">).displaySize(), 42);
});

test("#displaySize() returns 4 for a multiple <select> without a size attribute", (t) => {
  t.equal(((<select multiple />) as Element<"select">).displaySize(), 4);
});

test("#displaySize() returns the size attribute for a multiple <select>", (t) => {
  t.equal(
    ((<select mulitple size="42" />) as Element<"select">).displaySize(),
    42,
  );
});

test("#optionsList() returns the list of <option> children for a simple <select> element", (t) => {
  const options = [
    <option>one</option>,
    <option>two</option>,
    <option>three</option>,
  ] as Array<Element<"option">>;
  const select = h.element("select", [], options);

  t.deepEqual(select.optionsList().toJSON(), Array.toJSON(options));
});

test("#optionsList() returns the list of <option> grandchildren for a <select> element with <optgroup> children", (t) => {
  const options = [<option>one</option>, <option>two</option>] as Array<
    Element<"option">
  >;
  const option = (<option>three</option>) as Element<"option">;
  const select = h.element(
    "select",
    [],
    [<optgroup>{options}</optgroup>, <optgroup>{option}</optgroup>],
  );

  t.deepEqual(
    select.optionsList().toJSON(),
    Array.toJSON([...options, option]),
  );
});

test("#optionsList() mixes children and grandchildren when allowed", (t) => {
  const one = (<option>one</option>) as Element<"option">;
  const twoThree = [<option>two</option>, <option>three</option>] as Array<
    Element<"option">
  >;
  const four = (<option>four</option>) as Element<"option">;
  const five = (<option>five</option>) as Element<"option">;
  const sixSeven = [<option>six</option>, <option>seven</option>] as Array<
    Element<"option">
  >;
  const select = h.element(
    "select",
    [],
    [
      one,
      <optgroup>{twoThree}</optgroup>,
      four,
      five,
      <optgroup>{sixSeven}</optgroup>,
    ],
  );

  t.deepEqual(
    select.optionsList().toJSON(),
    Array.toJSON([one, ...twoThree, four, five, ...sixSeven]),
  );
});

test("#optionsList() skips over non-direct children or grandchildren", (t) => {
  const one = (<option>one</option>) as Element<"option">;
  const twoThree = [<option>two</option>, <option>three</option>] as Array<
    Element<"option">
  >;
  const four = (<option>four</option>) as Element<"option">;
  const five = (<option>five</option>) as Element<"option">;
  const sixSeven = [
    <option>six</option>,
    <div>
      <option>seven</option>
    </div>,
  ] as Array<Element<"option">>;

  const select = h.element(
    "select",
    [],
    [
      // skipped as non-direct <option> child
      <div>{one}</div>,
      // skipped as non-direct <optgroup> child
      <div>
        <optgroup>{twoThree}</optgroup>
      </div>,
      // kept
      four,
      // kept
      five,
      // six is kept, seven is skipped as non-direct child of an <optgroup>
      <optgroup>{sixSeven}</optgroup>,
    ],
  );

  t.deepEqual(
    select.optionsList().toJSON(),
    Array.toJSON([four, five, sixSeven[0]]),
  );
});
