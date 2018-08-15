import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { ButtonType, getButtonType } from "../src/get-button-type";

test("Returns Null if not a Button", t => {
  const foo = <span />;
  t.equal(getButtonType(foo), null);
});

test("Returns Submit if type is Submit", t => {
  const foo = <button type="submit" />;
  t.equal(getButtonType(foo), ButtonType.Submit);
});

test("Returns Button if type is Button", t => {
  const foo = <button type="button" />;
  t.equal(getButtonType(foo), ButtonType.Button);
});

test("Returns Reset if type is Reset", t => {
  const foo = <button type="reset" />;
  t.equal(getButtonType(foo), ButtonType.Reset);
});
