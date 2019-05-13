import { Node } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-jsx";
import { Assertions, test } from "@siteimprove/alfa-test";
import { evaluate, EvaluateOptions } from "../src/evaluate";

function nodes(
  t: Assertions,
  scope: Node,
  context: Node,
  expression: string,
  expected: Array<Node>,
  options?: EvaluateOptions
) {
  const result = evaluate(scope, context, expression, options);

  if (result === null) {
    t.fail();
  } else {
    t.deepEqual([...result], expected, expression);
  }
}

const b1 = <b />;
const p = <p>{b1}</p>;

const i = <i />;
const b2 = <b>{i}</b>;
const span = <span>{b2}</span>;

const div = (
  <div>
    {p}
    {span}
  </div>
);

test("Evaluates an axis expression", t => {
  nodes(t, div, div, "self::*", [div]);
  nodes(t, div, div, "self::div", [div]);
  nodes(t, div, div, "self::p", []);

  nodes(t, div, div, "child::*", [p, span]);
  nodes(t, div, div, "child::p", [p]);
  nodes(t, div, div, "child::span", [span]);
});

test("Evaluates a path expression", t => {
  nodes(t, div, div, "span/b", [b2]);
  nodes(t, div, div, "span/b/i", [i]);
  nodes(t, div, div, "*/b", [b1, b2]);
});

test("Evaluates an absolute path expression", t => {
  nodes(t, div, div, "/", [div]);
  nodes(t, div, div, "/span", [span]);

  nodes(t, span, div, "/", [div]);
  nodes(t, span, div, "/span", [span]);

  nodes(t, div, div, "//b", [b1, b2]);
  nodes(t, div, div, "//span//i", [i]);
  nodes(t, div, div, "//p//i", []);
});
