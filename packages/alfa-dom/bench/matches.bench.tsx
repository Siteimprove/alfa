import { benchmark } from "@siteimprove/alfa-bench";
import { parseSelector } from "@siteimprove/alfa-css";
import { jsx } from "@siteimprove/alfa-jsx";
import { matches } from "../src/matches";

const element = <div id="foo" class="foo" href="foo" />;

const context = (
  <main>
    <header />
    <section>{element}</section>
  </main>
);

const id = parseSelector("#foo")!;
const className = parseSelector(".foo")!;
const type = parseSelector("div")!;
const attribute = parseSelector("[foo]")!;

benchmark()
  .add("Match an ID", () => {
    matches(element, context, id);
  })
  .add("Match a class", () => {
    matches(element, context, className);
  })
  .add("Match a type", () => {
    matches(element, context, type);
  })
  .add("Match an attribute", () => {
    matches(element, context, attribute);
  })
  .run();

const descendant = parseSelector("section div")!;
const directDescendant = parseSelector("section > div")!;
const sibling = parseSelector("section ~ div")!;
const directSibling = parseSelector("section + div")!;

benchmark()
  .add("Match a descendant", () => {
    matches(element, context, descendant);
  })
  .add("Match a direct descendant", () => {
    matches(element, context, directDescendant);
  })
  .add("Match a sibling", () => {
    matches(element, context, sibling);
  })
  .add("Match a direct sibling", () => {
    matches(element, context, directSibling);
  })
  .run();
