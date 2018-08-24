import { test } from "@siteimprove/alfa-test";
import { isBrowserSupported } from "../src/is-browser-supported";
import { withBrowsers } from "../src/with-browsers";

withBrowsers([["chrome", ">", "55"]], () => {
  test("Returns true if a given browser is supported", t => {
    t(isBrowserSupported("chrome"));
  });

  test("Returns false if a given browser is not supported", t => {
    t(!isBrowserSupported("opera"));
  });

  test("Returns true if a given browser version range is supported", t => {
    t(isBrowserSupported(["chrome", ">", "55"]));
  });

  test("Returns false if a given browser version range is not supported", t => {
    t(!isBrowserSupported(["chrome", "<=", "55"]));
  });
});
