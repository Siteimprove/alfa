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
