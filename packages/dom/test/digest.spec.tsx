import { test } from "@alfa/test";
import { Element } from "../src/types";
import { digest, hasDigest } from "../src/digest";

test("Computes the digest value of a DOM node", async t => {
  const foo: Element = <div class="foo">Hello world!</div>;

  await digest(foo);

  if (hasDigest(foo)) {
    t.is(foo.digest, "ZEFMOG4PLZ4SK7Ky0k5CdPa++++QJrK/r2YrIxIV3Ls=");
  } else {
    t.fail();
  }
});

test("Is order independant when digesting element attributes", async t => {
  const foo: Element = <div class="foo" id="foo" />;
  const bar: Element = <div id="foo" class="foo" />;

  await digest(foo);
  await digest(bar);

  if (hasDigest(foo) && hasDigest(bar)) {
    t.is(foo.digest, bar.digest);
  } else {
    t.fail();
  }
});

test("Correctly distinguishes literal boolean values from boolean attributes", async t => {
  const foo: Element = <div foo />;
  const bar: Element = <div foo="true" />;

  await digest(foo);
  await digest(bar);

  if (hasDigest(foo) && hasDigest(bar)) {
    t.isNot(foo.digest, bar.digest);
  } else {
    t.fail();
  }
});

test("Correctly handles cases of sorted boolean attributes", async t => {
  const foo: Element = <div bar foo />;
  const bar: Element = <div bar="foo" />;

  await digest(foo);
  await digest(bar);

  if (hasDigest(foo) && hasDigest(bar)) {
    t.isNot(foo.digest, bar.digest);
  } else {
    t.fail();
  }
});
