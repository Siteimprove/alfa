import { isElement, Node } from "@siteimprove/alfa-dom";
import { isIterable } from "@siteimprove/alfa-util";
import { Environment, Focus, withFocus } from "./environment";
import { coerceParameters, lookupFunction } from "./function";
import { functions } from "./functions";
import * as g from "./guards";
import { parse } from "./parse";
import { getTree, walkTree } from "./tree";
import * as t from "./types";
import { Expression, Value } from "./types";

export interface EvaluateOptions {
  composed?: boolean;
  flattened?: boolean;
}

export function* evaluate(
  scope: Node,
  context: Node,
  expression: string | Expression,
  options: EvaluateOptions = {}
): Iterable<Node> | null {
  if (typeof expression === "string") {
    const parsed = parse(expression);

    if (parsed === null) {
      return null;
    }

    expression = parsed;
  }

  const tree = getTree(scope, context);

  if (tree === null) {
    return null;
  }

  const environment: Environment = {
    focus: {
      item: tree,
      position: 1,
      size: 1
    },
    functions
  };

  const branches = evaluateExpression(expression, environment, options);

  for (const branch of branches) {
    yield branch.node;
  }
}

function* evaluateExpression(
  expression: Expression,
  environment: Environment,
  options: EvaluateOptions
): Iterable<Value> {
  if (g.isPathExpression(expression)) {
    yield* evaluatePathExpression(expression, environment, options);
  }

  if (g.isAxisExpression(expression)) {
    yield* evaluateAxisExpression(expression, environment, options);
  }

  if (g.isFunctionCallExpression(expression)) {
    yield* evaluateFunctionCallExpression(expression, environment, options);
  }
}

function* evaluatePathExpression(
  expression: t.PathExpression,
  environment: Environment,
  options: EvaluateOptions
): Iterable<Value> {
  const branches = [
    ...evaluateExpression(expression.left, environment, options)
  ];

  const seen = new Set<Value>();

  for (let i = 0, n = branches.length; i < n; i++) {
    const focus: Focus = {
      item: branches[i],
      position: i + 1,
      size: n
    };

    const subbranches = evaluateExpression(
      expression.right,
      withFocus(environment, focus),
      options
    );

    for (const branch of subbranches) {
      if (seen.has(branch)) {
        continue;
      }

      seen.add(branch);

      yield branch;
    }
  }
}

function* evaluateAxisExpression(
  expression: t.AxisExpression,
  environment: Environment,
  options: EvaluateOptions
): Iterable<Value> {
  let branches = walkTree(environment.focus.item, expression.axis);

  if (expression.test !== undefined) {
    branches = evaluateNodeTest(expression.test, branches);
  }

  yield* branches;
}

function* evaluateNodeTest(
  test: t.NodeTest,
  branches: Iterable<Value>
): Iterable<Value> {
  for (const branch of branches) {
    const { node } = branch;

    if (g.isKindTest(test)) {
      if (node.nodeType === test.kind) {
        yield branch;
      }
    } else {
      if (
        isElement(node) &&
        node.localName === test.name &&
        test.prefix === undefined
      ) {
        yield branch;
      }
    }
  }
}

function* evaluateFunctionCallExpression(
  expression: t.FunctionCallExpression,
  environment: Environment,
  options: EvaluateOptions
): Iterable<Value> {
  const { prefix, name, arity } = expression;

  const fn = lookupFunction(environment.functions, prefix, name, arity);

  if (fn !== null) {
    const parameters: Array<Iterable<Value>> = [];

    for (const parameter of expression.parameters) {
      parameters.push(evaluateExpression(parameter, environment, options));
    }

    const args = coerceParameters(fn, parameters);

    if (args !== null) {
      const result = fn.apply(environment, ...args);

      if (isIterable(result)) {
        yield* result;
      } else {
        yield result;
      }
    }
  }
}
