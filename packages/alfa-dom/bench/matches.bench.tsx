import { benchmark } from "@siteimprove/alfa-bench";
import { jsx } from "@siteimprove/alfa-jsx";
import { matches } from "../src/matches";

const el = <div id="foo" class="foo" href="foo" />;

benchmark()
  .add("Matching against an ID", () => {
    matches(el, el, "#foo");
  })
  .add("Matching against a class", () => {
    matches(el, el, ".foo");
  })
  .add("Matching against an attribute", () => {
    matches(el, el, "[href=foo]");
  })
  .run();
