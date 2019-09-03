import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { querySelector, querySelectorAll } from "../src/query-selector";

test("Finds all elements matching a selector", t => {
  const foo1 = <div class="foo">Foo 1</div>;
  const foo2 = <div class="foo">Foo 2</div>;

  const context = (
    <div>
      {foo1}
      {foo2}
    </div>
  );

  t.deepEqual(querySelectorAll(context, context, ".foo"), [foo1, foo2]);
});

test("Finds the first element matching a selector", t => {
  const foo1 = <div class="foo">Foo 1</div>;
  const foo2 = <div class="foo">Foo 2</div>;

  const context = (
    <div>
      {foo1}
      {foo2}
    </div>
  );

  t.deepEqual(querySelector(context, context, ".foo"), foo1);
});
