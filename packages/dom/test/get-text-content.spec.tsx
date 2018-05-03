import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { getTextContent } from "../src/get-text-content";

test("Returns the textual content of a node and its descendants", async t => {
  t.is(
    getTextContent(
      <p>
        Hello <span>world</span>
      </p>
    ),
    "Hello world"
  );
});
