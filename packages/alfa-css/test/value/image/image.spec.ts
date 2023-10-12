import { test } from "@siteimprove/alfa-test";

import { Image, Lexer } from "../../../src";

function parse(input: string) {
  return Image.parse(Lexer.lex(input)).getUnsafe()[1].toJSON();
}

test("parse() parses an image with relative URL", (t) => {
  t.deepEqual(parse("url('foo.jpg')"), {
    type: "image",
    image: { type: "url", url: "foo.jpg" },
  });
});

test("parse() parses an image with absolute URL", (t) => {
  t.deepEqual(parse("url('https://example.com/foo.jpg')"), {
    type: "image",
    image: { type: "url", url: "https://example.com/foo.jpg" },
  });
});

test("parse() parses a linear gradient", (t) => {
  t.deepEqual(parse("linear-gradient(red, blue)"), {
    type: "image",
    image: {
      type: "gradient",
      kind: "linear",
      direction: { type: "side", side: "bottom" },
      items: [
        {
          type: "stop",
          color: { type: "color", format: "named", color: "red" },
          position: null,
        },
        {
          type: "stop",
          color: { type: "color", format: "named", color: "blue" },
          position: null,
        },
      ],
      repeats: false,
    },
  });
});

test("parse() parses a radial gradient", (t) => {
  t.deepEqual(parse("radial-gradient(red, blue)"), {
    type: "image",
    image: {
      type: "gradient",
      kind: "radial",
      shape: { type: "extent", shape: "circle", size: "farthest-corner" },
      position: {
        type: "position",
        horizontal: { type: "keyword", value: "center" },
        vertical: { type: "keyword", value: "center" },
      },
      items: [
        {
          type: "stop",
          color: { type: "color", format: "named", color: "red" },
          position: null,
        },
        {
          type: "stop",
          color: { type: "color", format: "named", color: "blue" },
          position: null,
        },
      ],
      repeats: false,
    },
  });
});
