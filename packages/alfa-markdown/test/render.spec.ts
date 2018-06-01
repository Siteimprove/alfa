import { test } from "@siteimprove/alfa-test";
import { render } from "../src/render";

test("Render", t => {
  const markdown = render({
    type: "heading",
    depth: 1,
    children: [
      {
        type: "text",
        value: "Alfa"
      }
    ]
  });

  t.is(markdown, "# Alfa");
});
