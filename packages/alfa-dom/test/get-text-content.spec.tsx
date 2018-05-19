import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getTextContent } from "../src/get-text-content";

test("Returns the textual content of a node and its descendants", t => {
  t.is(
    getTextContent(
      <p>
        Hello <span>world</span>
      </p>
    ),
    "Hello world"
  );
});
