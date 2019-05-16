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

test("Can parse an integer literal", t => {
  xpath<t.IntegerLiteralExpression>(t, `123`, {
    type: ExpressionType.IntegerLiteral,
    value: 123
  });
});

test("Can parse an axis expression", t => {
  xpath<t.AxisExpression>(t, `foo`, {
    type: ExpressionType.Axis,
    axis: "child",
    test: {
      name: "foo"
    },
    predicates: []
  });

  xpath<t.AxisExpression>(t, `foo:bar`, {
    type: ExpressionType.Axis,
    axis: "child",
    test: {
      prefix: "foo",
      name: "bar"
    },
    predicates: []
  });

  xpath<t.AxisExpression>(t, `child::foo`, {
    type: ExpressionType.Axis,
    axis: "child",
    test: {
      name: "foo"
    },
    predicates: []
  });

  xpath<t.AxisExpression>(t, `self::foo`, {
    type: ExpressionType.Axis,
    axis: "self",
    test: {
      name: "foo"
    },
    predicates: []
  });
});

test("Can parse a wildcard axis expression", t => {
  xpath<t.AxisExpression>(t, `self::*`, {
    type: ExpressionType.Axis,
    axis: "self",
    test: null,
    predicates: []
  });

  xpath<t.AxisExpression>(t, `*`, {
    type: ExpressionType.Axis,
    axis: "child",
    test: null,
    predicates: []
  });
});

test("Can parse an abbreviated axis expression", t => {
  xpath<t.AxisExpression>(t, `@*`, {
    type: ExpressionType.Axis,
    axis: "attribute",
    test: null,
    predicates: []
  });

  xpath<t.AxisExpression>(t, `@foo`, {
    type: ExpressionType.Axis,
    axis: "attribute",
    test: {
      name: "foo"
    },
    predicates: []
  });

  xpath<t.AxisExpression>(t, `..`, {
    type: ExpressionType.Axis,
    axis: "parent",
    test: null,
    predicates: []
  });
});

test("Can parse an axis expression with a predicate", t => {
  xpath<t.AxisExpression>(t, `foo[bar]`, {
    type: ExpressionType.Axis,
    axis: "child",
    test: {
      name: "foo"
    },
    predicates: [
      expr<t.AxisExpression>({
        type: ExpressionType.Axis,
        axis: "child",
        test: {
          name: "bar"
        },
        predicates: []
      })
    ]
  });

  xpath<t.AxisExpression>(t, `foo[123]`, {
    type: ExpressionType.Axis,
    axis: "child",
    test: {
      name: "foo"
    },
    predicates: [
      expr<t.IntegerLiteralExpression>({
        type: ExpressionType.IntegerLiteral,
        value: 123
      })
    ]
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
      },
      predicates: []
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "bar"
      },
      predicates: []
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
        },
        predicates: []
      },
      right: {
        type: ExpressionType.Axis,
        axis: "child",
        test: {
          name: "bar"
        },
        predicates: []
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "baz"
      },
      predicates: []
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
        axis: "self",
        test: null,
        predicates: []
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
          axis: "self",
          test: null,
          predicates: []
        })
      ]
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "foo"
      },
      predicates: []
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
            axis: "self",
            test: null,
            predicates: []
          })
        ]
      },
      right: {
        type: ExpressionType.Axis,
        axis: "child",
        test: {
          name: "foo"
        },
        predicates: []
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "bar"
      },
      predicates: []
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
            axis: "self",
            test: null,
            predicates: []
          })
        ]
      },
      right: {
        type: ExpressionType.Axis,
        axis: "descendant-or-self",
        test: null,
        predicates: []
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "foo"
      },
      predicates: []
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
              axis: "self",
              test: null,
              predicates: []
            })
          ]
        },
        right: {
          type: ExpressionType.Axis,
          axis: "descendant-or-self",
          test: null,
          predicates: []
        }
      },
      right: {
        type: ExpressionType.Axis,
        axis: "child",
        test: {
          name: "foo"
        },
        predicates: []
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "bar"
      },
      predicates: []
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
                axis: "self",
                test: null,
                predicates: []
              })
            ]
          },
          right: {
            type: ExpressionType.Axis,
            axis: "descendant-or-self",
            test: null,
            predicates: []
          }
        },
        right: {
          type: ExpressionType.Axis,
          axis: "child",
          test: {
            name: "foo"
          },
          predicates: []
        }
      },
      right: {
        type: ExpressionType.Axis,
        axis: "descendant-or-self",
        test: null,
        predicates: []
      }
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "bar"
      },
      predicates: []
    }
  });
});

test("Can parse a path expression with a predicate", t => {
  xpath<t.PathExpression>(t, `foo/bar[baz]`, {
    type: ExpressionType.Path,
    left: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "foo"
      },
      predicates: []
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "bar"
      },
      predicates: [
        expr<t.AxisExpression>({
          type: ExpressionType.Axis,
          axis: "child",
          test: {
            name: "baz"
          },
          predicates: []
        })
      ]
    }
  });

  xpath<t.PathExpression>(t, `foo/bar[123]`, {
    type: ExpressionType.Path,
    left: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "foo"
      },
      predicates: []
    },
    right: {
      type: ExpressionType.Axis,
      axis: "child",
      test: {
        name: "bar"
      },
      predicates: [
        expr<t.IntegerLiteralExpression>({
          type: ExpressionType.IntegerLiteral,
          value: 123
        })
      ]
    }
  });
});

test("Can parse a context item expression", t => {
  xpath<t.ContextItemExpression>(t, `.`, {
    type: ExpressionType.ContextItem
  });
});
