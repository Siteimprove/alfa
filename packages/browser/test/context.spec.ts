import { test } from "@alfa/test";
import { BrowsingContext } from "../src/context";

test("Creates a browsing context based on an entry point", async t => {
  const context = new BrowsingContext<{ upper: (input: string) => string }>(
    require.resolve("./fixtures/context")
  );

  const result = await context.evaluate(({ upper }, input) => {
    return upper(input);
  }, "hello world");

  await context.close();

  t.is(result, "HELLO WORLD");
});
