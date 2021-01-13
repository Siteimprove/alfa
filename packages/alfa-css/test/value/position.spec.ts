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

test("parse() parses center", (t) => {
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
});

test("parse() parses right", (t) => {
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
});

test("parse() parses top", (t) => {
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
});

test("parse() parses 10px", (t) => {
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
});

test("parse() parses top 10px as a one token value", (t) => {
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
});

test("parse() parses 10px left as a one token value", (t) => {
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

test("parse() parses left bottom", (t) => {
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
});

test("parse() parses bottom left", (t) => {
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
});

test("parse() parses left center", (t) => {
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
});

test("parse() parses center left", (t) => {
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
});

test("parse() parses left 10px", (t) => {
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
});

test("parse() parses 10px top", (t) => {
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
});

test("parse() parses 10px 20%", (t) => {
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
});

test("parse() parses 10px top 20% as a two tokens value", (t) => {
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
});

test("parse() parses left 10px 20% as a two tokens value", (t) => {
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
});

test("parse() parses left 10px center as a three tokens value when allowed", (t) => {
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

  parse(t, "left 10px center", {
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
});

test("parse() parses left top 10px as a three tokens value when allowed", (t) => {
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
});

test("parse() parses top 10px left as a three tokens value when allowed", (t) => {
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
});

test("parse() parses top left 10px as a three tokens value when allowed", (t) => {
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
});

test("parse() parses right 10px bottom 20%", (t) => {
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
});

test("parse() parses bottom 20% right 10px", (t) => {
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

test("parse() parses center 20% right 10px as a two tokens value", (t) => {
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
