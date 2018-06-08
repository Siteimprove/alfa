import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { serialize } from "../src/serialize";

test("Serializes DOM nodes to HTML", t => {
  t.equal(
    serialize(
      <div class="foo">
        <p>Hello world</p>
      </div>
    ),
    '<div class="foo"><p>Hello world</p></div>'
  );
});

test("Correctly escapes attribute values", t => {
  t.equal(
    serialize(<div class="&lt; &gt; &amp; &quot; &nbsp;" />),
    '<div class="< > &amp; &quot; &nbsp;"></div>'
  );
});

test("Correctly escapes text content", t => {
  t.equal(
    serialize(<div>&lt; &gt; &amp; &quot; &nbsp;</div>),
    '<div>&lt; &gt; &amp; " &nbsp;</div>'
  );
});
