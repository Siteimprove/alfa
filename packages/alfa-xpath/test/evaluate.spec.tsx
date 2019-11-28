import { Node } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Assertions, test } from "@siteimprove/alfa-test";
import { evaluate } from "../src/evaluate";

function nodes(
  t: Assertions,
  scope: Node,
  expression: string,
  expected: Array<Node>,
  options?: evaluate.Options
) {
  const result = evaluate(scope, expression, options);

  if (result === null) {
    t.fail();
  } else {
    t.deepEqual([...result], expected, expression);
  }
}

const b1 = <b>Foo</b>;
const p = <p>{b1}</p>;

const i = <i>Foo</i>;
const b2 = <b>{i}</b>;
const span = <span>{b2}</span>;

const div = (
  <div>
    {p}
    {span}
  </div>
);

test("Evaluates an axis expression", t => {
  nodes(t, div, "self::*", [div]);
  nodes(t, div, "self::div", [div]);
  nodes(t, div, "self::p", []);

  nodes(t, div, "child::*", [p, span]);
  nodes(t, div, "child::p", [p]);
  nodes(t, div, "child::span", [span]);
});

test("Evaluates an axis expression with a predicate", t => {
  nodes(t, div, "descendant::b[i]", [b2]);

  nodes(t, div, "child::*[1]", [p]);
  nodes(t, div, "child::*[2]", [span]);
});

test("Evaluates a path expression", t => {
  nodes(t, div, "span/b", [b2]);
  nodes(t, div, "span/b/i", [i]);
  nodes(t, div, "*/b", [b1, b2]);
});

test("Evaluates an absolute path expression", t => {
  nodes(t, div, "/", [div]);
  nodes(t, div, "/span", [span]);

  nodes(t, span, "/", [div]);
  nodes(t, span, "/span", [span]);

  nodes(t, span, "./span", []);
  nodes(t, span, "./b", [b2]);

  nodes(t, div, "//b", [b1, b2]);
  nodes(t, div, "//span//i", [i]);
  nodes(t, div, "//p//i", []);
});

test("Evaluates a path expression with a predicate", t => {
  nodes(t, div, "//b[i]", [b2]);
});
