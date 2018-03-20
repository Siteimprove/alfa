import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { find, findAll } from "../src/find";

test("Finds all elements matching a selector", async t => {
  const foo1 = <div class="foo">Foo 1</div>;
  const foo2 = <div class="foo">Foo 2</div>;

  const context = (
    <div>
      {foo1}
      {foo2}
    </div>
  );

  t.deepEqual(findAll(context, ".foo"), [foo1, foo2]);
});

test("Finds the first element matching a selector", async t => {
  const foo1 = <div class="foo">Foo 1</div>;
  const foo2 = <div class="foo">Foo 2</div>;

  const context = (
    <div>
      {foo1}
      {foo2}
    </div>
  );

  t.deepEqual(find(context, ".foo"), foo1);
});
