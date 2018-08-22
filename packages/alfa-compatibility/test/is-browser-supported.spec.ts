import { test } from "@siteimprove/alfa-test";
import { isBrowserSupported } from "../src/is-browser-supported";
import { BrowserName, Comparator, Version } from "../src/types";

const browsers: Array<[BrowserName, Comparator, Version]> = [
  ["chrome", ">", "55"],
  ["chrome", ">", "50"]
];

test("Returns true if a given browser is supported", t => {
  t(isBrowserSupported("chrome", { browsers }));
});

test("Returns false if a given browser is not supported", t => {
  t(!isBrowserSupported("opera", { browsers }));
});

test("Returns true if a given browser version range is supported", t => {
  t(isBrowserSupported(["chrome", ">", "55"], { browsers }));
});

test("Returns false if a given browser version range is not supported", t => {
  t(!isBrowserSupported(["chrome", "<=", "55"], { browsers }));
});
