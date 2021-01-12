import { Slice } from "@siteimprove/alfa-slice";
import { Assertions, test } from "@siteimprove/alfa-test";

import { Lexer, Position, Token } from "../../src";

function parse(input: string, allowThreeTokens: boolean = false) {
  return Position.parse(allowThreeTokens)(Slice.of(Lexer.lex(input)));
}

function testParse(
  t: Assertions,
  input: string,
  expected: Position.JSON,
  expectedRemainder?: Slice.JSON<Token>,
  allowThreeTokens: boolean = false
) {
  const [remainder, position] = parse(input, allowThreeTokens).get();

  t.deepEqual(position.toJSON(), expected, input);

  if (expectedRemainder !== undefined) {
    t.deepEqual(remainder.toJSON(), expectedRemainder);
  }
}

//    testing 1 token values

test("parse() parses center", (t) => {
  testParse(t, "center", {
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
});

test("parse() parses right", (t) => {
  testParse(t, "right", {
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
});

test("parse() parses top", (t) => {
  testParse(t, "top", {
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
});

test("parse()  parses 10px", (t) => {
  testParse(t, "10px", {
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
});

test("parse() parses top 10px as a one token value", (t) => {
  testParse(
    t,
    "top 10px",
    {
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
    },
    [
      {
        type: "whitespace",
      },
      {
        isInteger: true,
        isSigned: false,
        type: "dimension",
        unit: "px",
        value: 10,
      },
    ]
  );
});

test("parse() parses 10px left as a one token value", (t) => {
  testParse(
    t,
    "10px left",
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
    [
      {
        type: "whitespace",
      },
      {
        type: "ident",
        value: "left",
      },
    ]
  );
});

//     testing 2 tokens values

test("parse() parses left bottom", (t) => {
  testParse(t, "left bottom", {
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
});

test("parse() parses bottom left", (t) => {
  testParse(t, "bottom left", {
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
});

test("parse() parses left center", (t) => {
  testParse(t, "left center", {
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
});

test("parse() parses center left", (t) => {
  testParse(t, "center left", {
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
});

test("parse() parses left 10px", (t) => {
  testParse(t, "left 10px", {
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
});

test("parse() parses 10px top", (t) => {
  testParse(t, "10px top", {
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
      type: "side",
      side: {
        type: "keyword",
        value: "top",
      },
      offset: null,
    },
  });
});

test("parse() parses 10px 20%", (t) => {
  testParse(t, "10px 20%", {
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
      offset: {
        type: "percentage",
        value: 0.2,
      },
      side: {
        type: "keyword",
        value: "top",
      },
      type: "side",
    },
  });
});
