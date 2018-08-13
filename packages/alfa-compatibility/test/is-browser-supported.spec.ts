import { test } from "@siteimprove/alfa-test";
import { isBrowserSupported } from "../src/is-browser-supported";

test("Returns true if a given browser is supported", t => {
  t(isBrowserSupported("chrome", { browsers: "chrome > 55, firefox > 50" }));
});

test("Returns false if a given browser is not supported", t => {
  t(!isBrowserSupported("opera", { browsers: "chrome > 55, firefox > 50" }));
});

test("Returns true if a given browserslist query is supported", t => {
  t(isBrowserSupported("chrome > 55", { browsers: "chrome > 55" }));
});

test("Returns false if a given browserslist query is not supported", t => {
  t(!isBrowserSupported("chrome 55", { browsers: "chrome > 55" }));
});
