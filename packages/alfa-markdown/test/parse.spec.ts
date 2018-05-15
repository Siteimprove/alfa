import { test } from "@siteimprove/alfa-test";
import { parse } from "../src/parse";

test("Parse", async t => {
  const markdown = parse("# Alfa");

  t.deepEqual(markdown, {
    type: "root",
    children: [
      {
        type: "heading",
        depth: 1,
        children: [
          {
            type: "text",
            value: "Alfa"
          }
        ]
      }
    ]
  });
});
