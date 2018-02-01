import { test } from "@alfa/test";
import { parse } from "../src/parser";

test("Parse", async t => {
  const markdown = parse("# Alfa\n");

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
