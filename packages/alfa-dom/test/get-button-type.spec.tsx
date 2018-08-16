import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { ButtonType, getButtonType } from "../src/get-button-type";

test("Returns null when type is not defined", t => {
  const foo = <span />;
  t.equal(getButtonType(foo), null);
});

test("Returns Submit when type is set to Submit", t => {
  const foo = <button type="submit" />;
  t.equal(getButtonType(foo), ButtonType.Submit);
});

test("Returns Button when type is set to Button", t => {
  const foo = <button type="button" />;
  t.equal(getButtonType(foo), ButtonType.Button);
});

test("Returns Reset when type is set to Reset", t => {
  const foo = <button type="reset" />;
  t.equal(getButtonType(foo), ButtonType.Reset);
});
