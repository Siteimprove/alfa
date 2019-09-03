import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import { ButtonType, getButtonType } from "../src/get-button-type";

test("Returns null when type is not defined", t => {
  t.equal(getButtonType(<span />), null);
});

test("Returns Submit when type is set to Submit", t => {
  t.equal(getButtonType(<button type="submit" />), ButtonType.Submit);
});

test("Returns Button when type is set to Button", t => {
  t.equal(getButtonType(<button type="button" />), ButtonType.Button);
});

test("Returns Reset when type is set to Reset", t => {
  t.equal(getButtonType(<button type="reset" />), ButtonType.Reset);
});
