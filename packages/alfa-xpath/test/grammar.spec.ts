import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../src/alphabet";
import { Grammar } from "../src/grammar";
import * as t from "../src/types";
import { Expression, ExpressionType } from "../src/types";

function xpath<E extends Expression>(
  t: Assertions,
  input: string,
  expected: E | null
) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, Grammar);

  if (expected === null) {
    t(parser.result === null || !parser.done);
  } else {
    t(parser.done, input);
    t.deepEqual(parser.result, expected, input);
  }
}

function expr<E extends Expression>(expression: E): E {
  return expression;
}

test("Can parse an axis expression", t => {
  xpath<t.AxisExpression>(t, `foo`, {
    type: ExpressionType.Axis,
    axis: "child",
    test: {
      name: "foo"
    }
  });

  xpath<t.AxisExpression>(t, `foo:bar`, {
    type: ExpressionType.Axis,
    axis: "child",
    test: {
      prefix: "foo",
      name: "bar"
    }
  });

  xpath<t.AxisExpression>(t, `child::foo`, {
    type: ExpressionType.Axis,
    axis: "child",
    test: {
      name: "foo"
    }
  });

  xpath<t.AxisExpression>(t, `self::foo`, {
    type: ExpressionType.Axis,
    axis: "self",
    test: {
      name: "foo"
    }
  });

  xpath<t.AxisExpression>(t, `self::*`, {
    type: ExpressionType.Axis,
    axis: "self"
  });

  xpath<t.AxisExpression>(t, `*`, {
    type: ExpressionType.Axis,
    axis: "child"
  });

  xpath<t.AxisExpression>(t, `@*`, {
    type: ExpressionType.Axis,
    axis: "attribute"
  });

  xpath<t.AxisExpression>(t, `@foo`, {
    type: ExpressionType.Axis,
    axis: "attribute",
    test: {
      name: "foo"
    }
  });

  xpath<t.AxisExpression>(t, `..`, {
    type: ExpressionType.Axis,
    axis: "parent"
  });
});

test("Can parse a path expression", t => {
  xpath<t.PathExpression>(t, `foo/bar`, {
    type: ExpressionType.Path,
    left: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "foo"
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "bar"
      }
    }
  });

  xpath<t.PathExpression>(t, `foo/bar/baz`, {
    type: ExpressionType.Path,
    left: {
      type: ExpressionType.Path,
      left: {
        type: ExpressionType.Axis,
        axis: "child",
        test: {
          name: "foo"
        }
      },
      right: {
        type: ExpressionType.Axis,
        axis: "child",
        test: {
          name: "bar"
        }
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "baz"
      }
    }
  });
});

test("Can parse an absolute path expression", t => {
  xpath<t.FunctionCallExpression>(t, `/`, {
    type: ExpressionType.FunctionCall,
    prefix: "fn",
    name: "root",
    arity: 1,
    parameters: [
      expr<t.AxisExpression>({
        type: ExpressionType.Axis,
        axis: "self"
      })
    ]
  });

  xpath<t.PathExpression>(t, `/foo`, {
    type: ExpressionType.Path,
    left: {
      type: ExpressionType.FunctionCall,
      prefix: "fn",
      name: "root",
      arity: 1,
      parameters: [
        expr<t.AxisExpression>({
          type: ExpressionType.Axis,
          axis: "self"
        })
      ]
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "foo"
      }
    }
  });

  xpath<t.PathExpression>(t, `/foo/bar`, {
    type: ExpressionType.Path,
    left: {
      type: ExpressionType.Path,
      left: {
        type: ExpressionType.FunctionCall,
        prefix: "fn",
        name: "root",
        arity: 1,
        parameters: [
          expr<t.AxisExpression>({
            type: ExpressionType.Axis,
            axis: "self"
          })
        ]
      },
      right: {
        type: ExpressionType.Axis,
        axis: "child",
        test: {
          name: "foo"
        }
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "bar"
      }
    }
  });

  xpath<t.PathExpression>(t, `//foo`, {
    type: ExpressionType.Path,
    left: {
      type: ExpressionType.Path,
      left: {
        type: ExpressionType.FunctionCall,
        prefix: "fn",
        name: "root",
        arity: 1,
        parameters: [
          expr<t.AxisExpression>({
            type: ExpressionType.Axis,
            axis: "self"
          })
        ]
      },
      right: {
        type: ExpressionType.Axis,
        axis: "descendant-or-self"
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "foo"
      }
    }
  });

  xpath<t.PathExpression>(t, `//foo/bar`, {
    type: ExpressionType.Path,
    left: {
      type: ExpressionType.Path,
      left: {
        type: ExpressionType.Path,
        left: {
          type: ExpressionType.FunctionCall,
          prefix: "fn",
          name: "root",
          arity: 1,
          parameters: [
            expr<t.AxisExpression>({
              type: ExpressionType.Axis,
              axis: "self"
            })
          ]
        },
        right: {
          type: ExpressionType.Axis,
          axis: "descendant-or-self"
        }
      },
      right: {
        type: ExpressionType.Axis,
        axis: "child",
        test: {
          name: "foo"
        }
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "bar"
      }
    }
  });

  xpath<t.PathExpression>(t, `//foo//bar`, {
    type: ExpressionType.Path,
    left: {
      type: ExpressionType.Path,
      left: {
        type: ExpressionType.Path,
        left: {
          type: ExpressionType.Path,
          left: {
            type: ExpressionType.FunctionCall,
            prefix: "fn",
            name: "root",
            arity: 1,
            parameters: [
              expr<t.AxisExpression>({
                type: ExpressionType.Axis,
                axis: "self"
              })
            ]
          },
          right: {
            type: ExpressionType.Axis,
            axis: "descendant-or-self"
          }
        },
        right: {
          type: ExpressionType.Axis,
          axis: "child",
          test: {
            name: "foo"
          }
        }
      },
      right: {
        type: ExpressionType.Axis,
        axis: "descendant-or-self"
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "bar"
      }
    }
  });
});
