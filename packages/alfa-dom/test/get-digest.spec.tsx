import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Some } from "@siteimprove/alfa-option";
import { getDigest } from "../src/get-digest";
import { isElement } from "../src/guards";

const foo = (
  <div class="foo">
    Hello world!
    <shadow>
      <p>
        <slot />
      </p>
    </shadow>
  </div>
);

test("Computes the digest value of a DOM node", t => {
  t.deepEqual(
    getDigest(foo, <div>{foo}</div>),
    Some.of("tDSQ3voWR9QMpPuaCUR32eba1JgFuu8KwAi0buXtj4g=")
  );
});

test("Computes the composed digest value of a DOM node", t => {
  t.deepEqual(
    getDigest(foo, <div>{foo}</div>, { composed: true }),
    Some.of("P+dmcj1gzI4tbc1QwQQr2L+TIU+x89YtejkkIvHiPoU=")
  );
});

test("Computes the flattened digest value of a DOM node", t => {
  t.deepEqual(
    getDigest(foo, <div>{foo}</div>, { flattened: true }),
    Some.of("u1KUVzWsE4MXbT5/bXx+ZaFrg29nI7IrcBEvDoABKns=")
  );
});

test("Is order independant when digesting element attributes", t => {
  const foo = <div class="foo" id="foo" />;
  const bar = <div id="foo" class="foo" />;

  t.deepEqual(
    getDigest(foo, <div>{foo}</div>),
    getDigest(bar, <div>{bar}</div>)
  );
});

test("Correctly distinguishes literal boolean values from boolean attributes", t => {
  const foo = <div foo />;
  const bar = <div foo="true" />;

  t.notDeepEqual(
    getDigest(foo, <div>{foo}</div>),
    getDigest(bar, <div>{bar}</div>)
  );
});

test("Correctly handles cases of sorted boolean attributes", t => {
  const foo = <div bar foo />;
  const bar = <div bar="foo" />;

  t.notDeepEqual(
    getDigest(foo, <div>{foo}</div>),
    getDigest(bar, <div>{bar}</div>)
  );
});

test("Correctly separates attribute names and values", t => {
  const foo = <div barf="oo" />;
  const bar = <div bar="foo" />;

  t.notDeepEqual(
    getDigest(foo, <div>{foo}</div>),
    getDigest(bar, <div>{bar}</div>)
  );
});

test("Can filter out unwanted nodes", t => {
  const foo = <div>Foo</div>;
  const bar = <div />;

  t.deepEqual(
    getDigest(foo, foo, {
      filters: {
        node: isElement
      }
    }),
    getDigest(bar, bar)
  );
});

test("Can filter out unwanted attributes", t => {
  const foo = <div id="foo" class="foo" />;
  const bar = <div class="foo" />;

  t.deepEqual(
    getDigest(foo, foo, {
      filters: {
        attribute: attribute => attribute.localName !== "id"
      }
    }),
    getDigest(bar, bar)
  );
});
