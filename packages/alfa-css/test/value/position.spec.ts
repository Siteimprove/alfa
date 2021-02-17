import { test } from "@siteimprove/alfa-test";

import { Lexer } from "../../src/syntax/lexer";
import { Position } from "../../src/value/position";

function parse(input: string, legacySyntax: boolean = false) {
  return Position.parse(legacySyntax)(Lexer.lex(input)).map(([, position]) =>
    position.toJSON()
  );
}

test(".parse() parses 1-token positions", (t) => {
  t.deepEqual(parse("center").get(), {
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

  t.deepEqual(parse("right").get(), {
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

  t.deepEqual(parse("top").get(), {
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

  t.deepEqual(parse("10px").get(), {
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
  t.deepEqual(parse("top 10px").get(), {
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
  t.deepEqual(parse("10px left").get(), {
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

test(".parse() parses 2-token positions", (t) => {
  t.deepEqual(parse("left bottom").get(), {
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

  t.deepEqual(parse("bottom left").get(), {
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

  t.deepEqual(parse("left center").get(), {
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

  t.deepEqual(parse("center left").get(), {
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

  t.deepEqual(parse("left 10px").get(), {
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

  t.deepEqual(parse("10px top").get(), {
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

  t.deepEqual(parse("10px 20%").get(), {
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
  t.deepEqual(parse("10px top 20%", true).get(), {
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
  });

  // "20%" is not consumed
  t.deepEqual(parse("left 10px 20%", true).get(), {
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
  });

  // "10px" not consumed
  t.deepEqual(parse("left top 10px").get(), {
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
  t.deepEqual(parse("top 10px left").get(), {
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
  t.deepEqual(parse("top left 10px").get(), {
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
  t.deepEqual(parse("center 20% right 10px").get(), {
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

test(".parse() parses 3-token positions", (t) => {
  t.deepEqual(parse("left 10px center", true).get(), {
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
  });

  t.deepEqual(parse("left top 10px", true).get(), {
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
  });

  t.deepEqual(parse("top 10px left", true).get(), {
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
  });

  t.deepEqual(parse("top left 10px", true).get(), {
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
  });
});

test(".parse() parses 4-token positions", (t) => {
  t.deepEqual(parse("right 10px bottom 20%").get(), {
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

  t.deepEqual(parse("bottom 20% right 10px").get(), {
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
