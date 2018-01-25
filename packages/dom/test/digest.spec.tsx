import { test } from "@alfa/test";
import { Element } from "../src/types";
import { digest, hasDigest } from "../src/digest";

test("Computes the digest value of a DOM node", async t => {
  const foo: Element = <div class="foo">Hello world!</div>;

  digest(foo);

  if (hasDigest(foo)) {
    t.is(foo.digest, "ZEFMOG4PLZ4SK7Ky0k5CdPa++++QJrK/r2YrIxIV3Ls=");
  } else {
    t.fail();
  }
});

test("Is order independant when digesting element attributes", async t => {
  const foo: Element = <div class="foo" id="foo">Hello world!</div>;
  const bar: Element = <div id="foo" class="foo">Hello world!</div>;

  digest(foo);
  digest(bar);

  if (hasDigest(foo) && hasDigest(bar)) {
    t.is(foo.digest, bar.digest)
  } else {
    t.fail();
  }
})
