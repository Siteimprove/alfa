import { test } from "@siteimprove/alfa-test";

import { Lexer, Radial } from "../../../src";

function parse(input: string) {
  return Radial.parse(Lexer.lex(input)).map(([_, circle]) => circle.toJSON());
}

test("parse() parses a radial gradient with no shape or position", (t) => {
  t.deepEqual(parse("radial-gradient(red, blue)").getUnsafe(), {
    type: "gradient",
    kind: "radial",
    shape: {
      type: "extent",
      shape: "circle",
      size: "farthest-corner",
    },
    position: {
      type: "position",
      horizontal: {
        type: "keyword",
        value: "center",
      },
      vertical: {
        type: "keyword",
        value: "center",
      },
    },
    items: [
      {
        type: "stop",
        position: null,
        color: {
          type: "color",
          format: "named",
          color: "red",
        },
      },
      {
        type: "stop",
        position: null,
        color: {
          type: "color",
          format: "named",
          color: "blue",
        },
      },
    ],
    repeats: false,
  });
});

test("parse() parses a radial gradient with an extent", (t) => {
  t.deepEqual(parse("radial-gradient(closest-side, red, blue)").getUnsafe(), {
    type: "gradient",
    kind: "radial",
    shape: {
      type: "extent",
      shape: "circle",
      size: "closest-side",
    },
    position: {
      type: "position",
      horizontal: {
        type: "keyword",
        value: "center",
      },
      vertical: {
        type: "keyword",
        value: "center",
      },
    },
    items: [
      {
        type: "stop",
        position: null,
        color: {
          type: "color",
          format: "named",
          color: "red",
        },
      },
      {
        type: "stop",
        position: null,
        color: {
          type: "color",
          format: "named",
          color: "blue",
        },
      },
    ],
    repeats: false,
  });
});

test("parse() parses a radial gradient with an extent and a position", (t) => {
  t.deepEqual(
    parse("radial-gradient(closest-side at bottom left, red, blue)").getUnsafe(),
    {
      type: "gradient",
      kind: "radial",
      shape: {
        type: "extent",
        shape: "circle",
        size: "closest-side",
      },
      position: {
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
      },
      items: [
        {
          type: "stop",
          position: null,
          color: {
            type: "color",
            format: "named",
            color: "red",
          },
        },
        {
          type: "stop",
          position: null,
          color: {
            type: "color",
            format: "named",
            color: "blue",
          },
        },
      ],
      repeats: false,
    }
  );
});

test("parse() parses a radial gradient with a circle", (t) => {
  for (const input of ["1px", "1px circle", "circle 1px"]) {
    t.deepEqual(
      parse(`radial-gradient(${input}, red, blue)`).getUnsafe(),
      {
        type: "gradient",
        kind: "radial",
        shape: {
          type: "circle",
          radius: {
            type: "length",
            value: 1,
            unit: "px",
          },
        },
        position: {
          type: "position",
          horizontal: {
            type: "keyword",
            value: "center",
          },
          vertical: {
            type: "keyword",
            value: "center",
          },
        },
        items: [
          {
            type: "stop",
            position: null,
            color: {
              type: "color",
              format: "named",
              color: "red",
            },
          },
          {
            type: "stop",
            position: null,
            color: {
              type: "color",
              format: "named",
              color: "blue",
            },
          },
        ],
        repeats: false,
      },
      input
    );
  }
});

test("parse() parses a radial gradient with an ellipse", (t) => {
  for (const input of ["1px 2px", "1px 2px ellipse", "ellipse 1px 2px"]) {
    t.deepEqual(
      parse(`radial-gradient(${input}, red, blue)`).getUnsafe(),
      {
        type: "gradient",
        kind: "radial",
        shape: {
          type: "ellipse",
          horizontal: {
            type: "length",
            value: 1,
            unit: "px",
          },
          vertical: {
            type: "length",
            value: 2,
            unit: "px",
          },
        },
        position: {
          type: "position",
          horizontal: {
            type: "keyword",
            value: "center",
          },
          vertical: {
            type: "keyword",
            value: "center",
          },
        },
        items: [
          {
            type: "stop",
            position: null,
            color: {
              type: "color",
              format: "named",
              color: "red",
            },
          },
          {
            type: "stop",
            position: null,
            color: {
              type: "color",
              format: "named",
              color: "blue",
            },
          },
        ],
        repeats: false,
      },
      input
    );
  }
});

test("parse() parses a radial gradient with a circular extent", (t) => {
  for (const input of [
    "circle",
    "circle farthest-corner",
    "farthest-corner circle",
  ]) {
    t.deepEqual(
      parse(`radial-gradient(${input}, red, blue)`).getUnsafe(),
      {
        type: "gradient",
        kind: "radial",
        shape: {
          type: "extent",
          shape: "circle",
          size: "farthest-corner",
        },
        position: {
          type: "position",
          horizontal: {
            type: "keyword",
            value: "center",
          },
          vertical: {
            type: "keyword",
            value: "center",
          },
        },
        items: [
          {
            type: "stop",
            position: null,
            color: {
              type: "color",
              format: "named",
              color: "red",
            },
          },
          {
            type: "stop",
            position: null,
            color: {
              type: "color",
              format: "named",
              color: "blue",
            },
          },
        ],
        repeats: false,
      },
      input
    );
  }
});

test("parse() parses a radial gradient with an elliptical extent", (t) => {
  for (const input of [
    "ellipse",
    "ellipse farthest-corner",
    "farthest-corner ellipse",
  ]) {
    t.deepEqual(
      parse(`radial-gradient(${input}, red, blue)`).getUnsafe(),
      {
        type: "gradient",
        kind: "radial",
        shape: {
          type: "extent",
          shape: "ellipse",
          size: "farthest-corner",
        },
        position: {
          type: "position",
          horizontal: {
            type: "keyword",
            value: "center",
          },
          vertical: {
            type: "keyword",
            value: "center",
          },
        },
        items: [
          {
            type: "stop",
            position: null,
            color: {
              type: "color",
              format: "named",
              color: "red",
            },
          },
          {
            type: "stop",
            position: null,
            color: {
              type: "color",
              format: "named",
              color: "blue",
            },
          },
        ],
        repeats: false,
      },
      input
    );
  }
});
