import { test } from "@siteimprove/alfa-test";
import { isHex } from "../src/is-hex";

test("Returns true when passing a capitalised hexadecimal character", t => {
  t.equal(isHex("F".charCodeAt(0)), true);
});

test("Returns true when passing a hexadecimal character", t => {
  t.equal(isHex("f".charCodeAt(0)), true);
});

test("Returns false when passing a non hexademical character", t => {
  t.equal(isHex("G".charCodeAt(0)), false);
});
