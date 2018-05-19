import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Element } from "../src/types";
import { getDigest } from "../src/get-digest";

test("Computes the digest value of a DOM node", t => {
  const foo = <div class="foo">Hello world!</div>;

  t.is(getDigest(foo), "uHv50qOfqUJBuFExof9E4o0SVhy0eSSpYTCbBpznFEk=");
});

test("Is order independant when digesting element attributes", t => {
  const foo = <div class="foo" id="foo" />;
  const bar = <div id="foo" class="foo" />;

  t.is(getDigest(foo), getDigest(bar));
});

test("Correctly distinguishes literal boolean values from boolean attributes", t => {
  const foo = <div foo />;
  const bar = <div foo="true" />;

  t.isNot(getDigest(foo), getDigest(bar));
});

test("Correctly handles cases of sorted boolean attributes", t => {
  const foo = <div bar foo />;
  const bar = <div bar="foo" />;

  t.isNot(getDigest(foo), getDigest(bar));
});
