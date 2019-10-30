import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { ButtonType, getButtonType } from "../src/get-button-type";

test("getButtonType() gets the type of a default button", t => {
  const button = <button type="button" />;

  t.deepEqual(getButtonType(button, button), Some.of(ButtonType.Button));
});

test("getButtonType() gets the type of a submit button", t => {
  const button = <button type="submit" />;

  t.deepEqual(getButtonType(button, button), Some.of(ButtonType.Submit));
});

test("getButtonType() gets the type of a reset button", t => {
  const button = <button type="reset" />;

  t.equal(getButtonType(button, button), Some.of(ButtonType.Reset));
});

test("getButtonType() defaults to button for button elements without a type attribute", t => {
  const button = <button />;

  t.equal(getButtonType(button, button), Some.of(ButtonType.Button));
});

test("getButtonType() returns none when getting the type of a non-button element", t => {
  const span = <span />;

  t.equal(getButtonType(span, span), None);
});
