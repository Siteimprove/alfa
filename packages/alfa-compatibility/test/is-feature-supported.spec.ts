import { test } from "@siteimprove/alfa-test";
import { isFeatureSupported } from "../src/is-feature-supported";
import { withBrowsers } from "../src/with-browsers";

test("Returns true if a given feature is supported", t => {
  withBrowsers([["ie", ">", "8"]], () => {
    t(isFeatureSupported("css.properties.border-radius"));
  });
});

test("Returns false if a given feature is not supported", t => {
  withBrowsers([["ie", "<=", "8"]], () => {
    t(!isFeatureSupported("css.properties.border-radius"));
  });
});
