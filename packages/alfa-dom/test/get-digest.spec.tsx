import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getDigest } from "../src/get-digest";

test("Computes the digest value of a DOM node", t => {
  const foo = <div class="foo">Hello world!</div>;

  t.equal(
    getDigest(foo, <div>{foo}</div>),
    "uHv50qOfqUJBuFExof9E4o0SVhy0eSSpYTCbBpznFEk="
  );
});

test("Is order independant when digesting element attributes", t => {
  const foo = <div class="foo" id="foo" />;
  const bar = <div id="foo" class="foo" />;

  t.equal(getDigest(foo, <div>{foo}</div>), getDigest(bar, <div>{bar}</div>));
});

test("Correctly distinguishes literal boolean values from boolean attributes", t => {
  const foo = <div foo />;
  const bar = <div foo="true" />;

  t.notEqual(
    getDigest(foo, <div>{foo}</div>),
    getDigest(bar, <div>{bar}</div>)
  );
});

test("Correctly handles cases of sorted boolean attributes", t => {
  const foo = <div bar foo />;
  const bar = <div bar="foo" />;

  t.notEqual(
    getDigest(foo, <div>{foo}</div>),
    getDigest(bar, <div>{bar}</div>)
  );
});

test("Can filter out unwanted nodes", t => {
  const foo = <div>Foo</div>;
  const bar = <div />;

  t.equal(
    getDigest(foo, foo, {
      node: node => node.nodeType === 1
    }),
    getDigest(bar, bar)
  );
});

test("Can filter out unwanted attributes", t => {
  const foo = <div id="foo" class="foo" />;
  const bar = <div class="foo" />;

  t.equal(
    getDigest(foo, foo, {
      attribute: attribute => attribute.localName !== "id"
    }),
    getDigest(bar, bar)
  );
});
