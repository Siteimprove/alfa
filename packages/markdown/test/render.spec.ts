import { test } from "@alfa/test";
import { render } from "../src/render";

test("Render", async t => {
  const markdown = render({
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

  t.is(markdown, "# Alfa\n");
});
