import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { Element } from "../src/types";
import { find } from "../src/find";
import { matches } from "../src/matches";

test("Matches an element against a tag", async t => {
  const div = <div />;
  t.true(matches(div, div, "div"));
});

test("Matches an element against a class", async t => {
  const div = <div class="foo" />;
  t.true(matches(div, div, ".foo"));
});

test("Matches an element against an ID", async t => {
  const div = <div id="foo" />;
  t.true(matches(div, div, "#foo"));
});

test("Matches an element against an attribute without a value", async t => {
  const div = <div foo />;
  t.true(matches(div, div, "[foo]"));
});

test("Matches an element against an attribute with a value", async t => {
  const div = <div foo="bar" />;
  t.true(matches(div, div, "[foo=bar]"));
});

test("Matches an element with a class against a list of selectors", async t => {
  const div = <div class="foo" />;
  t.true(matches(div, div, ".foo, #bar"));
});

test("Matches an element with an ID against a list of selectors", async t => {
  const div = <div id="bar" />;
  t.true(matches(div, div, ".foo, #bar"));
});

test("Matches an element against a descendant selector", async t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p>{foo}</p>
    </div>
  );

  t.true(matches(foo, document, "div #foo"));
});

test("Matches an element against a direct descendant selector", async t => {
  const foo = <span id="foo" />;
  const document = <div>{foo}</div>;

  t.true(matches(foo, document, "div > #foo"));
});

test("Matches an element against a sibling selector", async t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p />
      <b />
      {foo}
    </div>
  );

  t.true(matches(foo, document, "p ~ #foo"));
});

test("Matches an element against a direct sibling selector", async t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p />
      {foo}
    </div>
  );

  t.true(matches(foo, document, "p + #foo"));
});
