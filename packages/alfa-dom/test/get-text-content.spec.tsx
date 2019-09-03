import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getTextContent } from "../src/get-text-content";

test("Returns the textual content of a node and its descendants", t => {
  const p = (
    <p>
      Hello <span>world</span>
    </p>
  );
  t.equal(getTextContent(p, <div>{p}!</div>), "Hello world");
});
