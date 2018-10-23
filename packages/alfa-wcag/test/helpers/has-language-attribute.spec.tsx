import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { hasLanguageAttribute } from "../../src/helpers/has-language-attribute";

test("Returns false, if tag has no language attribute", t => {
  const tag = <html />;
  t(!hasLanguageAttribute(tag));
});

test("Returns false, if tag has an empty language attribute", t => {
  const tag = <html lang="" />;
  t(!hasLanguageAttribute(tag));
});

test("Returns true, if tag has a language attribute", t => {
  const tag = <html lang="en" />;
  t(hasLanguageAttribute(tag));
});
