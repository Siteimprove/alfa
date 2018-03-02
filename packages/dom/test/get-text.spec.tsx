import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { getText } from "../src/get-text";

test("Returns the textual content of a node and its descendants", async t => {
  t.is(
    getText(
      <p>
        Hello <span>world</span>
      </p>
    ),
    "Hello world"
  );
});
