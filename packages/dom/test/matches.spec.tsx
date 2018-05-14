import { jsx } from "@alfa/jsx";
import { test } from "@alfa/test";
import { Element } from "../src/types";
import { find } from "../src/find";
import { matches } from "../src/matches";

test("Matches an element against a tag", t => {
  const div = <div />;
  t.true(matches(div, div, "div"));
});

test("Matches an element against a class", t => {
  const div = <div class="foo" />;
  t.true(matches(div, div, ".foo"));
});

test("Matches an element against an ID", t => {
  const div = <div id="foo" />;
  t.true(matches(div, div, "#foo"));
});

test("Matches an element against an attribute without a value", t => {
  const div = <div foo />;
  t.true(matches(div, div, "[foo]"));
});

test("Matches an element against an attribute with a value", t => {
  const div = <div foo="bar" />;
  t.true(matches(div, div, "[foo=bar]"));
});

test("Matches an element against an attribute with a casing modifier", t => {
  const div = <div foo="BAR" />;
  t.true(matches(div, div, "[foo=bar i]"));
});

test("Matches an element with a class against a list of selectors", t => {
  const div = <div class="foo" />;
  t.true(matches(div, div, ".foo, #bar"));
});

test("Matches an element with an ID against a list of selectors", t => {
  const div = <div id="bar" />;
  t.true(matches(div, div, ".foo, #bar"));
});

test("Matches an element against a descendant selector", t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p>{foo}</p>
    </div>
  );

  t.true(matches(foo, document, "div #foo"));
});

test("Matches an element against a direct descendant selector", t => {
  const foo = <span id="foo" />;
  const document = <div>{foo}</div>;

  t.true(matches(foo, document, "div > #foo"));
});

test("Matches an element against a sibling selector", t => {
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

test("Matches an element against a direct sibling selector", t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p />
      {foo}
    </div>
  );

  t.true(matches(foo, document, "p + #foo"));
});

test("Matches an element against a scope selector", t => {
  const div = <div />;
  t.true(matches(div, div, ":scope", { scope: div }));
});
