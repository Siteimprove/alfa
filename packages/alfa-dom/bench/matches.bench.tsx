import { benchmark } from "@siteimprove/alfa-bench";
import { jsx } from "@siteimprove/alfa-jsx";
import { parseSelector } from "@siteimprove/alfa-css";
import { matches } from "../src/matches";

const element = <foo id="foo" class="foo" href="foo" />;

const id = parseSelector("#foo")!;
const className = parseSelector(".foo")!;
const type = parseSelector("foo")!;
const attribute = parseSelector("[foo]")!;

benchmark()
  .add("Match an ID", () => {
    matches(element, element, id);
  })
  .add("Match a class", () => {
    matches(element, element, className);
  })
  .add("Match a type", () => {
    matches(element, element, type);
  })
  .add("Match an attribute", () => {
    matches(element, element, attribute);
  })
  .run();
