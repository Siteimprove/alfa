import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { serialize } from "../src/serialize";

test("Serializes DOM nodes to HTML", t => {
  const foo = (
    <div class="foo">
      <p>Hello world</p>
    </div>
  );

  t.equal(
    serialize(foo, <div>{foo}</div>),
    '<div class="foo"><p>Hello world</p></div>'
  );
});

test("Serializes DOM nodes to flattened HTML", t => {
  const foo = (
    <div class="foo">
      <p>Hello world</p>
      <shadow>
        <div class="bar">
          <slot />
        </div>
      </shadow>
    </div>
  );

  t.equal(
    serialize(foo, <div>{foo}</div>, { flattened: true }),
    '<div class="foo"><div class="bar"><p>Hello world</p></div></div>'
  );
});

test("Correctly escapes attribute values", t => {
  const div = <div class="&lt; &gt; &amp; &quot; &nbsp;" />;

  t.equal(
    serialize(div, <div>{div}</div>),
    '<div class="< > &amp; &quot; &nbsp;"></div>'
  );
});

test("Correctly escapes text content", t => {
  const div = <div>&lt; &gt; &amp; &quot; &nbsp;</div>;

  t.equal(
    serialize(div, <div>{div}</div>),
    '<div>&lt; &gt; &amp; " &nbsp;</div>'
  );
});
