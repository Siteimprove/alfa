import { test } from "@siteimprove/alfa-test";
import { isFeatureSupported } from "../src/is-feature-supported";
import { Browser } from "../src/types";

test("Returns true if a given feature is supported", t => {
  t(
    isFeatureSupported("css.properties.border-radius", {
      browsers: [[Browser.IE, ">", "8"]]
    })
  );
});

test("Returns false if a given feature is not supported", t => {
  t(
    !isFeatureSupported("css.properties.border-radius", {
      browsers: [[Browser.IE, ">=", "8"]]
    })
  );
});
