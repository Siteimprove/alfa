import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getInputType, InputType } from "../src/get-input-type";

test("Returns null for non input element", t => {
  const div = <div />;
  t.equal(getInputType(div), null);
});

test("Returns file for input element with file type", t => {
  const input = <input type="file" />;
  t.equal(getInputType(input), InputType.File);
});

test("Returns hidden for input element with hidden type", t => {
  const input = <input type="hidden" />;
  t.equal(getInputType(input), InputType.Hidden);
});

test("Returns search for input element with search type", t => {
  const input = <input type="search" />;
  t.equal(getInputType(input), InputType.Search);
});

test("Returns image for input element with image type", t => {
  const input = <input type="image" />;
  t.equal(getInputType(input), InputType.Image);
});

test("Returns button for input element with button type", t => {
  const input = <input type="button" />;
  t.equal(getInputType(input), InputType.Button);
});

test("Returns reset for input element with reset type", t => {
  const input = <input type="reset" />;
  t.equal(getInputType(input), InputType.Reset);
});

test("Returns radio for input element with radio type", t => {
  const input = <input type="radio" />;
  t.equal(getInputType(input), InputType.Radio);
});

test("Returns submit for input element with submit type", t => {
  const input = <input type="submit" />;
  t.equal(getInputType(input), InputType.Submit);
});

test("Returns text for input element with undefined type", t => {
  const input = <input />;
  t.equal(getInputType(input), InputType.Text);
});

test("Returns tel for input element with tel type", t => {
  const input = <input type="tel" />;
  t.equal(getInputType(input), InputType.Tel);
});
