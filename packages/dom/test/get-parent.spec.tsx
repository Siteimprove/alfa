import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { getParent } from "../src/get-parent";

test("Returns the parent of an element", async t => {
  const child = <span class="child" />;
  const parent = <span class="parent">{child}</span>;

  t.is(getParent(child, <div>{parent}</div>), parent);
});

test("Gets the correct parent depending on context", async t => {
  const child = <span class="child" />;
  const parent1 = <span class="parent1">{child}</span>;
  const parent2 = <span class="parent2">{child}</span>;

  t.is(getParent(child, <div>{parent1}</div>), parent1);
  t.is(getParent(child, <div>{parent2}</div>), parent2);
});
