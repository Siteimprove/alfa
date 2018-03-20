import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { serialize } from "../src/serialize";

test("Serializes DOM nodes to HTML", async t => {
  const document = (
    <div class="foo">
      <p>Hello world</p>
    </div>
  );

  t.is(serialize(document), '<div class="foo"><p>Hello world</p></div>');
});

test("Correctly escapes attribute values", async t => {
  const document = <div class="&lt; &gt; &amp; &quot; &nbsp;" />;

  t.is(serialize(document), '<div class="< > &amp; &quot; &nbsp;"></div>');
});

test("Correctly escapes text content", async t => {
  const document = <div>&lt; &gt; &amp; &quot; &nbsp;</div>;

  t.is(serialize(document), '<div>&lt; &gt; &amp; " &nbsp;</div>');
});
