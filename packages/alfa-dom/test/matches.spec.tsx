import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { matches } from "../src/matches";

test("Matches an element against a tag", t => {
  const div = <div />;
  t(matches(div, div, "div"));
});

test("Matches an element against a class", t => {
  const div = <div class="foo" />;
  t(matches(div, div, ".foo"));
});

test("Matches an element against an ID", t => {
  const div = <div id="foo" />;
  t(matches(div, div, "#foo"));
});

test("Matches an element against an attribute without a value", t => {
  const div = <div foo />;
  t(matches(div, div, "[foo]"));
});

test("Matches an element against an attribute with a value", t => {
  const div = <div foo="bar" />;
  t(matches(div, div, "[foo=bar]"));
});

test("Matches an element against an attribute with a casing modifier", t => {
  const div = <div foo="bAR" />;
  t(matches(div, div, "[foo=Bar i]"));
});

test("Matches an element with a class against a list of selectors", t => {
  const div = <div class="foo" />;
  t(matches(div, div, ".foo, #bar"));
});

test("Matches an element with an ID against a list of selectors", t => {
  const div = <div id="bar" />;
  t(matches(div, div, ".foo, #bar"));
});

test("Matches an element against a descendant selector", t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p>{foo}</p>
    </div>
  );

  t(matches(foo, document, "div p #foo"));
  t(!matches(foo, document, "p div #foo"));
});

test("Matches an element against a direct descendant selector", t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p>{foo}</p>
    </div>
  );

  t(matches(foo, document, "div > p > #foo"));
  t(!matches(foo, document, "p > div > #foo"));
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

  t(matches(foo, document, "p ~ b ~ #foo"));
  t(!matches(foo, document, "b ~ p ~ #foo"));
});

test("Matches an element against a direct sibling selector", t => {
  const foo = <span id="foo" />;
  const document = (
    <div>
      <p />
      <b />
      {foo}
    </div>
  );

  t(matches(foo, document, "p + b + #foo"));
  t(!matches(foo, document, "b + p + #foo"));
});

test("Matches an element against a scope selector", t => {
  const div = <div />;
  t(matches(div, div, ":scope", { scope: div }));
});
