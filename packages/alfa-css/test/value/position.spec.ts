import { Assertions, test } from "@siteimprove/alfa-test";

import { Slice } from "@siteimprove/alfa-slice";

import { Lexer } from "../../src/syntax/lexer";
import { Position } from "../../src/value/position";

function parse(
  t: Assertions,
  input: string,
  expected: Position.JSON,
  legacySyntax: boolean = false
) {
  t.deepEqual(
    Position.parse(legacySyntax)(Slice.of(Lexer.lex(input)))
      .map(([, position]) => position)
      .get()
      .toJSON(),
    expected,
    input
  );
}

test("parse() parses 1-token positions", (t) => {
  parse(t, "center", {
    type: "position",
    horizontal: {
      type: "keyword",
      value: "center",
    },
    vertical: {
      type: "keyword",
      value: "center",
    },
  });

  parse(t, "right", {
    type: "position",
    horizontal: {
      type: "side",
      side: {
        type: "keyword",
        value: "right",
      },
      offset: null,
    },
    vertical: {
      type: "keyword",
      value: "center",
    },
  });

  parse(t, "top", {
    type: "position",
    horizontal: {
      type: "keyword",
      value: "center",
    },
    vertical: {
      type: "side",
      side: {
        type: "keyword",
        value: "top",
      },
      offset: null,
    },
  });

  parse(t, "10px", {
    type: "position",
    horizontal: {
      type: "length",
      unit: "px",
      value: 10,
    },
    vertical: {
      type: "keyword",
      value: "center",
    },
  });

  // "10px" is not consumed
  parse(t, "top 10px", {
    type: "position",
    horizontal: {
      type: "keyword",
      value: "center",
    },
    vertical: {
      type: "side",
      side: {
        type: "keyword",
        value: "top",
      },
      offset: null,
    },
  });

  // "left" is not consumed
  parse(t, "10px left", {
    type: "position",
    horizontal: {
      type: "length",
      unit: "px",
      value: 10,
    },
    vertical: {
      type: "keyword",
      value: "center",
    },
  });
});

test("parse() parses 2-token positions", (t) => {
  parse(t, "left bottom", {
    type: "position",
    horizontal: {
      type: "side",
      side: {
        type: "keyword",
        value: "left",
      },
      offset: null,
    },
    vertical: {
      type: "side",
      side: {
        type: "keyword",
        value: "bottom",
      },
      offset: null,
    },
  });

  parse(t, "bottom left", {
    type: "position",
    horizontal: {
      type: "side",
      side: {
        type: "keyword",
        value: "left",
      },
      offset: null,
    },
    vertical: {
      type: "side",
      side: {
        type: "keyword",
        value: "bottom",
      },
      offset: null,
    },
  });

  parse(t, "left center", {
    type: "position",
    horizontal: {
      type: "side",
      side: {
        type: "keyword",
        value: "left",
      },
      offset: null,
    },
    vertical: {
      type: "keyword",
      value: "center",
    },
  });

  parse(t, "center left", {
    type: "position",
    horizontal: {
      type: "side",
      side: {
        type: "keyword",
        value: "left",
      },
      offset: null,
    },
    vertical: {
      type: "keyword",
      value: "center",
    },
  });

  parse(t, "left 10px", {
    type: "position",
    horizontal: {
      type: "side",
      side: {
        type: "keyword",
        value: "left",
      },
      offset: null,
    },
    vertical: {
      type: "length",
      unit: "px",
      value: 10,
    },
  });

  parse(t, "10px top", {
    type: "position",
    horizontal: {
      type: "length",
      unit: "px",
      value: 10,
    },
    vertical: {
      type: "side",
      side: {
        type: "keyword",
        value: "top",
      },
      offset: null,
    },
  });

  parse(t, "10px 20%", {
    type: "position",
    horizontal: {
      type: "length",
      unit: "px",
      value: 10,
    },
    vertical: {
      type: "percentage",
      value: 0.2,
    },
  });

  // "20%" is not consumed
  parse(
    t,
    "10px top 20%",
    {
      type: "position",
      horizontal: {
        type: "length",
        unit: "px",
        value: 10,
      },
      vertical: {
        offset: null,
        side: {
          type: "keyword",
          value: "top",
        },
        type: "side",
      },
    },
    true
  );

  // "20%" is not consumed
  parse(
    t,
    "left 10px 20%",
    {
      type: "position",
      horizontal: {
        offset: null,
        side: {
          type: "keyword",
          value: "left",
        },
        type: "side",
      },
      vertical: {
        type: "length",
        unit: "px",
        value: 10,
      },
    },
    true
  );

  // "10px" not consumed
  parse(t, "left top 10px", {
    type: "position",
    horizontal: {
      offset: null,
      side: {
        type: "keyword",
        value: "left",
      },
      type: "side",
    },
    vertical: {
      offset: null,
      side: {
        type: "keyword",
        value: "top",
      },
      type: "side",
    },
  });

  // "left" not consumed
  parse(t, "top 10px left", {
    type: "position",
    horizontal: {
      type: "keyword",
      value: "center",
    },
    vertical: {
      offset: null,
      side: {
        type: "keyword",
        value: "top",
      },
      type: "side",
    },
  });

  // "10px" not consumed
  parse(t, "top left 10px", {
    type: "position",
    horizontal: {
      offset: null,
      side: {
        type: "keyword",
        value: "left",
      },
      type: "side",
    },
    vertical: {
      offset: null,
      side: {
        type: "keyword",
        value: "top",
      },
      type: "side",
    },
  });

  // "right 10px" not consumed
  parse(t, "center 20% right 10px", {
    type: "position",
    horizontal: {
      type: "keyword",
      value: "center",
    },
    vertical: {
      type: "percentage",
      value: 0.2,
    },
  });
});

test("parse() parses 3-token positions", (t) => {
  parse(
    t,
    "left 10px center",
    {
      type: "position",
      horizontal: {
        offset: {
          type: "length",
          unit: "px",
          value: 10,
        },
        side: {
          type: "keyword",
          value: "left",
        },
        type: "side",
      },
      vertical: {
        type: "keyword",
        value: "center",
      },
    },
    true
  );

  parse(
    t,
    "left top 10px",
    {
      type: "position",
      horizontal: {
        offset: null,
        side: {
          type: "keyword",
          value: "left",
        },
        type: "side",
      },
      vertical: {
        offset: {
          type: "length",
          unit: "px",
          value: 10,
        },
        side: {
          type: "keyword",
          value: "top",
        },
        type: "side",
      },
    },
    true
  );

  parse(
    t,
    "top 10px left",
    {
      type: "position",
      horizontal: {
        offset: null,
        side: {
          type: "keyword",
          value: "left",
        },
        type: "side",
      },
      vertical: {
        offset: {
          type: "length",
          unit: "px",
          value: 10,
        },
        side: {
          type: "keyword",
          value: "top",
        },
        type: "side",
      },
    },
    true
  );

  parse(
    t,
    "top left 10px",
    {
      type: "position",
      horizontal: {
        offset: {
          type: "length",
          unit: "px",
          value: 10,
        },
        side: {
          type: "keyword",
          value: "left",
        },
        type: "side",
      },
      vertical: {
        offset: null,
        side: {
          type: "keyword",
          value: "top",
        },
        type: "side",
      },
    },
    true
  );
});

test("parse() parses 4-token positions", (t) => {
  parse(t, "right 10px bottom 20%", {
    type: "position",
    horizontal: {
      offset: {
        type: "length",
        unit: "px",
        value: 10,
      },
      side: {
        type: "keyword",
        value: "right",
      },
      type: "side",
    },
    vertical: {
      offset: {
        type: "percentage",
        value: 0.2,
      },
      side: {
        type: "keyword",
        value: "bottom",
      },
      type: "side",
    },
  });

  parse(t, "bottom 20% right 10px", {
    type: "position",
    horizontal: {
      offset: {
        type: "length",
        unit: "px",
        value: 10,
      },
      side: {
        type: "keyword",
        value: "right",
      },
      type: "side",
    },
    vertical: {
      offset: {
        type: "percentage",
        value: 0.2,
      },
      side: {
        type: "keyword",
        value: "bottom",
      },
      type: "side",
    },
  });
});
