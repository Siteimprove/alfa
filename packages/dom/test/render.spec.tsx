import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { render } from "../src/render";

test("Renders DOM nodes to text", async t => {
  const document = (
    <div class="foo">
      <p>Hello world</p>
    </div>
  );

  t.is(render(document), '<div class="foo"><p>Hello world</p></div>');
});
