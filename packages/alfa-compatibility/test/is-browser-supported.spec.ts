import { test } from "@siteimprove/alfa-test";
import { isBrowserSupported } from "../src/is-browser-supported";
import { Browser, Comparator, Version } from "../src/types";

const browsers: Array<[Browser, Comparator, Version]> = [
  [Browser.Chrome, ">", "55"],
  [Browser.Firefox, ">", "50"]
];

test("Returns true if a given browser is supported", t => {
  t(isBrowserSupported(Browser.Chrome, { browsers }));
});

test("Returns false if a given browser is not supported", t => {
  t(!isBrowserSupported(Browser.Opera, { browsers }));
});

test("Returns true if a given browser version range is supported", t => {
  t(isBrowserSupported([Browser.Chrome, ">", "55"], { browsers }));
});

test("Returns false if a given browser version range is not supported", t => {
  t(!isBrowserSupported([Browser.Chrome, "<=", "55"], { browsers }));
});
