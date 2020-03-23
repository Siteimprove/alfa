import { Assertions, test } from "@siteimprove/alfa-test";

import { Expression } from "../../src/expression";
import { Parser } from "../../src/syntax/parser";

function parse(t: Assertions, input: string, expected: Expression.JSON) {
  t.deepEqual(Parser.parse(input).get().toJSON(), expected, input);
}

test(".parse() parses an integer literal", (t) => {
  parse(t, `123`, {
    type: "integer",
    value: 123,
  });
});

test(".parse() parses an axis expression", (t) => {
  parse(t, `foo`, {
    type: "axis",
    axis: "child",
    test: {
      type: "name",
      prefix: null,
      name: "foo",
    },
    predicates: [],
  });

  parse(t, `foo:bar`, {
    type: "axis",
    axis: "child",
    test: {
      type: "name",
      prefix: "foo",
      name: "bar",
    },
    predicates: [],
  });

  parse(t, `child::foo`, {
    type: "axis",
    axis: "child",
    test: {
      type: "name",
      prefix: null,
      name: "foo",
    },
    predicates: [],
  });

  parse(t, `self::foo`, {
    type: "axis",
    axis: "self",
    test: {
      type: "name",
      prefix: null,
      name: "foo",
    },
    predicates: [],
  });

  parse(t, `self::node()`, {
    type: "axis",
    axis: "self",
    test: {
      type: "kind",
      kind: "node",
    },
    predicates: [],
  });

  parse(t, `self::element()`, {
    type: "axis",
    axis: "self",
    test: {
      type: "kind",
      kind: "element",
      name: null,
    },
    predicates: [],
  });

  parse(t, `self::element(foo)`, {
    type: "axis",
    axis: "self",
    test: {
      type: "kind",
      kind: "element",
      name: "foo",
    },
    predicates: [],
  });

  parse(t, `self::attribute(foo)`, {
    type: "axis",
    axis: "self",
    test: {
      type: "kind",
      kind: "attribute",
      name: "foo",
    },
    predicates: [],
  });
});

test(".parse() parses a wildcard axis expression", (t) => {
  parse(t, `self::*`, {
    type: "axis",
    axis: "self",
    test: null,
    predicates: [],
  });

  parse(t, `*`, {
    type: "axis",
    axis: "child",
    test: null,
    predicates: [],
  });
});

test(".parse() parses an abbreviated axis expression", (t) => {
  parse(t, `@*`, {
    type: "axis",
    axis: "attribute",
    test: null,
    predicates: [],
  });

  parse(t, `@foo`, {
    type: "axis",
    axis: "attribute",
    test: {
      type: "name",
      prefix: null,
      name: "foo",
    },
    predicates: [],
  });

  parse(t, `..`, {
    type: "axis",
    axis: "parent",
    test: {
      type: "kind",
      kind: "node",
    },
    predicates: [],
  });
});

test(".parse() parses an axis expression with a predicate", (t) => {
  parse(t, `foo[bar]`, {
    type: "axis",
    axis: "child",
    test: {
      type: "name",
      prefix: null,
      name: "foo",
    },
    predicates: [
      {
        type: "axis",
        axis: "child",
        test: {
          type: "name",
          prefix: null,
          name: "bar",
        },
        predicates: [],
      },
    ],
  });

  parse(t, `foo[123]`, {
    type: "axis",
    axis: "child",
    test: {
      type: "name",
      prefix: null,
      name: "foo",
    },
    predicates: [
      {
        type: "integer",
        value: 123,
      },
    ],
  });
});

test(".parse() parses a path expression", (t) => {
  parse(t, `foo/bar`, {
    type: "path",
    left: {
      type: "axis",
      axis: "child",
      test: {
        type: "name",
        prefix: null,
        name: "foo",
      },
      predicates: [],
    },
    right: {
      type: "axis",
      axis: "child",
      test: {
        type: "name",
        prefix: null,
        name: "bar",
      },
      predicates: [],
    },
  });

  parse(t, `foo/bar/baz`, {
    type: "path",
    left: {
      type: "path",
      left: {
        type: "axis",
        axis: "child",
        test: {
          type: "name",
          prefix: null,
          name: "foo",
        },
        predicates: [],
      },
      right: {
        type: "axis",
        axis: "child",
        test: {
          type: "name",
          prefix: null,
          name: "bar",
        },
        predicates: [],
      },
    },
    right: {
      type: "axis",
      axis: "child",
      test: {
        type: "name",
        prefix: null,
        name: "baz",
      },
      predicates: [],
    },
  });
});

test(".parse() parses an absolute path expression", (t) => {
  parse(t, `/`, {
    type: "function-call",
    prefix: "fn",
    name: "root",
    arity: 1,
    parameters: [
      {
        type: "axis",
        axis: "self",
        test: {
          type: "kind",
          kind: "node",
        },
        predicates: [],
      },
    ],
  });

  parse(t, `/foo`, {
    type: "path",
    left: {
      type: "function-call",
      prefix: "fn",
      name: "root",
      arity: 1,
      parameters: [
        {
          type: "axis",
          axis: "self",
          test: {
            type: "kind",
            kind: "node",
          },
          predicates: [],
        },
      ],
    },
    right: {
      type: "axis",
      axis: "child",
      test: {
        type: "name",
        prefix: null,
        name: "foo",
      },
      predicates: [],
    },
  });

  parse(t, `/foo/bar`, {
    type: "path",
    left: {
      type: "function-call",
      prefix: "fn",
      name: "root",
      arity: 1,
      parameters: [
        {
          type: "axis",
          axis: "self",
          test: {
            type: "kind",
            kind: "node",
          },
          predicates: [],
        },
      ],
    },
    right: {
      type: "path",
      left: {
        type: "axis",
        axis: "child",
        test: {
          type: "name",
          prefix: null,
          name: "foo",
        },
        predicates: [],
      },
      right: {
        type: "axis",
        axis: "child",
        test: {
          type: "name",
          prefix: null,
          name: "bar",
        },
        predicates: [],
      },
    },
  });

  parse(t, `//foo`, {
    type: "path",
    left: {
      type: "function-call",
      prefix: "fn",
      name: "root",
      arity: 1,
      parameters: [
        {
          type: "axis",
          axis: "self",
          test: {
            type: "kind",
            kind: "node",
          },
          predicates: [],
        },
      ],
    },
    right: {
      type: "path",
      left: {
        type: "axis",
        axis: "descendant-or-self",
        test: {
          type: "kind",
          kind: "node",
        },
        predicates: [],
      },
      right: {
        type: "axis",
        axis: "child",
        test: {
          type: "name",
          prefix: null,
          name: "foo",
        },
        predicates: [],
      },
    },
  });

  parse(t, `//foo/bar`, {
    type: "path",
    left: {
      type: "function-call",
      prefix: "fn",
      name: "root",
      arity: 1,
      parameters: [
        {
          type: "axis",
          axis: "self",
          test: {
            type: "kind",
            kind: "node",
          },
          predicates: [],
        },
      ],
    },
    right: {
      type: "path",
      left: {
        type: "axis",
        axis: "descendant-or-self",
        test: {
          type: "kind",
          kind: "node",
        },
        predicates: [],
      },
      right: {
        type: "path",
        left: {
          type: "axis",
          axis: "child",
          test: {
            type: "name",
            prefix: null,
            name: "foo",
          },
          predicates: [],
        },
        right: {
          type: "axis",
          axis: "child",
          test: {
            type: "name",
            prefix: null,
            name: "bar",
          },
          predicates: [],
        },
      },
    },
  });

  parse(t, `//foo//bar`, {
    type: "path",
    left: {
      type: "function-call",
      prefix: "fn",
      name: "root",
      arity: 1,
      parameters: [
        {
          type: "axis",
          axis: "self",
          test: {
            type: "kind",
            kind: "node",
          },
          predicates: [],
        },
      ],
    },
    right: {
      type: "path",
      left: {
        type: "axis",
        axis: "descendant-or-self",
        test: {
          type: "kind",
          kind: "node",
        },
        predicates: [],
      },
      right: {
        type: "path",
        left: {
          type: "axis",
          axis: "child",
          test: {
            type: "name",
            prefix: null,
            name: "foo",
          },
          predicates: [],
        },
        right: {
          type: "path",
          left: {
            type: "axis",
            axis: "descendant-or-self",
            test: {
              type: "kind",
              kind: "node",
            },
            predicates: [],
          },
          right: {
            type: "axis",
            axis: "child",
            test: {
              type: "name",
              prefix: null,
              name: "bar",
            },
            predicates: [],
          },
        },
      },
    },
  });
});

test(".parse() parses a path expression with a predicate", (t) => {
  parse(t, `foo/bar[baz]`, {
    type: "path",
    left: {
      type: "axis",
      axis: "child",
      test: {
        type: "name",
        prefix: null,
        name: "foo",
      },
      predicates: [],
    },
    right: {
      type: "axis",
      axis: "child",
      test: {
        type: "name",
        prefix: null,
        name: "bar",
      },
      predicates: [
        {
          type: "axis",
          axis: "child",
          test: {
            type: "name",
            prefix: null,
            name: "baz",
          },
          predicates: [],
        },
      ],
    },
  });

  parse(t, `foo/bar[123]`, {
    type: "path",
    left: {
      type: "axis",
      axis: "child",
      test: {
        type: "name",
        prefix: null,
        name: "foo",
      },
      predicates: [],
    },
    right: {
      type: "axis",
      axis: "child",
      test: {
        type: "name",
        prefix: null,
        name: "bar",
      },
      predicates: [
        {
          type: "integer",
          value: 123,
        },
      ],
    },
  });
});

test(".parse() parses a context item expression", (t) => {
  parse(t, `.`, {
    type: "context-item",
  });
});

test(".parse() parses a filter expression", (t) => {
  parse(t, `.[foo]`, {
    type: "filter",
    base: {
      type: "context-item",
    },
    predicates: [
      {
        type: "axis",
        axis: "child",
        test: {
          type: "name",
          prefix: null,
          name: "foo",
        },
        predicates: [],
      },
    ],
  });

  parse(t, `.[foo][bar]`, {
    type: "filter",
    base: {
      type: "context-item",
    },
    predicates: [
      {
        type: "axis",
        axis: "child",
        test: {
          type: "name",
          prefix: null,
          name: "foo",
        },
        predicates: [],
      },
      {
        type: "axis",
        axis: "child",
        test: {
          type: "name",
          prefix: null,
          name: "bar",
        },
        predicates: [],
      },
    ],
  });
});
