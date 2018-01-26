import { test } from "@alfa/test";
import { Element } from "../src/types";
import { digest, hasDigest } from "../src/digest";

test("Computes the digest value of a DOM node", async t => {
  const foo: Element = <div class="foo">Hello world!</div>;

  t.is(await digest(foo), "ZEFMOG4PLZ4SK7Ky0k5CdPa++++QJrK/r2YrIxIV3Ls=");
});

test("Is order independant when digesting element attributes", async t => {
  const foo: Element = <div class="foo" id="foo" />;
  const bar: Element = <div id="foo" class="foo" />;

  t.is(await digest(foo), await digest(bar));
});

test("Correctly distinguishes literal boolean values from boolean attributes", async t => {
  const foo: Element = <div foo />;
  const bar: Element = <div foo="true" />;

  t.isNot(await digest(foo), await digest(bar));
});

test("Correctly handles cases of sorted boolean attributes", async t => {
  const foo: Element = <div bar foo />;
  const bar: Element = <div bar="foo" />;

  t.isNot(await digest(foo), await digest(bar));
});
