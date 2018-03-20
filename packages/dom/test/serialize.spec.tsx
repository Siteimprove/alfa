import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { serialize } from "../src/serialize";

test("Serializes DOM nodes to HTML", async t => {
  t.is(
    serialize(
      <div class="foo">
        <p>Hello world</p>
      </div>
    ),
    '<div class="foo"><p>Hello world</p></div>'
  );
});

test("Correctly escapes attribute values", async t => {
  t.is(
    serialize(<div class="&lt; &gt; &amp; &quot; &nbsp;" />),
    '<div class="< > &amp; &quot; &nbsp;"></div>'
  );
});

test("Correctly escapes text content", async t => {
  t.is(
    serialize(<div>&lt; &gt; &amp; &quot; &nbsp;</div>),
    '<div>&lt; &gt; &amp; " &nbsp;</div>'
  );
});
