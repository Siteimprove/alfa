import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getInputType, InputType } from "../src/get-input-type";

test("getInputType() gets the type of a file input", t => {
  const input = <input type="file" />;

  t.deepEqual(getInputType(input, input), Some.of(InputType.File));
});

test("getInputType() gets the type of a hidden input", t => {
  const input = <input type="hidden" />;

  t.deepEqual(getInputType(input, input), Some.of(InputType.Hidden));
});

test("getInputType() gets the type of a search input", t => {
  const input = <input type="search" />;

  t.deepEqual(getInputType(input, input), Some.of(InputType.Search));
});

test("getInputType() gets the type of an image input", t => {
  const input = <input type="image" />;

  t.deepEqual(getInputType(input, input), Some.of(InputType.Image));
});

test("getInputType() gets the type of a button input", t => {
  const input = <input type="button" />;

  t.deepEqual(getInputType(input, input), Some.of(InputType.Button));
});

test("getInputType() gets the type of a reset input", t => {
  const input = <input type="reset" />;

  t.deepEqual(getInputType(input, input), Some.of(InputType.Reset));
});

test("getInputType() gets the type of a radio input", t => {
  const input = <input type="radio" />;

  t.deepEqual(getInputType(input, input), Some.of(InputType.Radio));
});

test("getInputType() gets the type of a submit input", t => {
  const input = <input type="submit" />;

  t.deepEqual(getInputType(input, input), Some.of(InputType.Submit));
});

test("getInputType() gets the type of a text input", t => {
  const input = <input />;

  t.deepEqual(getInputType(input, input), Some.of(InputType.Text));
});

test("getInputType() gets the type of a telephone input", t => {
  const input = <input type="tel" />;

  t.deepEqual(getInputType(input, input), Some.of(InputType.Tel));
});

test("getInputType() returns none when getting the type of a non-input element", t => {
  const div = <div />;

  t.equal(getInputType(div, div), None);
});
