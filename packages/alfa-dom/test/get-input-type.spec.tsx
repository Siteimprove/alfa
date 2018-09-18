import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getInputType, InputType } from "../src/get-input-type";

test("getInputType returns null for non input element", t => {
  const div = <div />;
  t.equal(getInputType(div), null);
});

test("getInputType returns file for input element with file type", t => {
  const input = <input type="file" />;
  t.equal(getInputType(input), InputType.File);
});

test("getInputType returns hidden for input element with hidden type", t => {
  const input = <input type="hidden" />;
  t.equal(getInputType(input), InputType.Hidden);
});

test("getInputType returns search for input element with search type", t => {
  const input = <input type="search" />;
  t.equal(getInputType(input), InputType.Search);
});

test("getInputType returns image for input element with image type", t => {
  const input = <input type="image" />;
  t.equal(getInputType(input), InputType.Image);
});

test("getInputType returns button for input element with button type", t => {
  const input = <input type="button" />;
  t.equal(getInputType(input), InputType.Button);
});

test("getInputType returns reset for input element with reset type", t => {
  const input = <input type="reset" />;
  t.equal(getInputType(input), InputType.Reset);
});

test("getInputType returns radio for input element with radio type", t => {
  const input = <input type="radio" />;
  t.equal(getInputType(input), InputType.Radio);
});

test("getInputType returns submit for input element with submit type", t => {
  const input = <input type="submit" />;
  t.equal(getInputType(input), InputType.Submit);
});

test("getInputType returns text for input element with undefined type", t => {
  const input = <input />;
  t.equal(getInputType(input), InputType.Text);
});

test("getInputType returns tel for input element with tel type", t => {
  const input = <input type="tel" />;
  t.equal(getInputType(input), InputType.Tel);
});
