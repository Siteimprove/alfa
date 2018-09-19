import { withBrowsers } from "@siteimprove/alfa-compatibility";
import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { ColorGrammar } from "../../../src/properties/color/grammar";
import { Color } from "../../../src/properties/color/types";
import { Values } from "../../../src/values";

function color(t: Assertions, input: string, expected: Color) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, ColorGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a named color", t => {
  color(t, "red", Values.color(255, 0, 0, 1));
});

test("Can parse a RGB color", t => {
  color(t, "rgb(0, 50%, 100)", Values.color(0, 127.5, 100, 1));
});

test("Can parse a RGBA color", t => {
  withBrowsers([["chrome", ">", "61"], ["firefox", ">", "48"]], () => {
    color(t, "rgba(0, 50%, 100, 0.5)", Values.color(0, 127.5, 100, 0.5));
  });

  withBrowsers([["firefox", "52"], ["ie", "8"]], () => {
    color(t, "rgba(0, 50%, 100, 0.5)", Values.color(0, 0, 0, 0));
  });
});

test("Can parse an HSL color", t => {
  withBrowsers([["chrome", ">", "61"], ["firefox", ">", "48"]], () => {
    color(t, "hsl(225, 55%, 26%)", Values.color(30, 48, 103, 1));
  });
  withBrowsers([["firefox", "52"], ["ie", "8"]], () => {
    color(t, "hsl(225, 55%, 26%)", Values.color(0, 0, 0, 0));
  });
});

test("Can parse a HSLA color", t => {
  color(t, "hsla(3, 55%, 26%, 0.5)", Values.color(103, 33, 30, 0.5));
});

test("Can parse an achromatic HSL color", t => {
  color(t, "hsl(23, 0%, 26%)", Values.color(66, 66, 66, 1));
});

test("Can not parse a HSLA color with wrong paramter type", t => {
  color(t, "hsla(23%, 0%, 26%, 1)", Values.color(0, 0, 0, 0));

  color(t, "hsla(23, 0, 26%, 1)", Values.color(0, 0, 0, 0));

  color(t, "hsla(23, 0%, 26, 1)", Values.color(0, 0, 0, 0));

  color(t, "hsla(23, 0%, 26%, 40%)", Values.color(0, 0, 0, 0));
});

test("Can not parse a HSLA color with wrong paramter size", t => {
  color(t, "hsla(23, 0%)", Values.color(0, 0, 0, 0));

  color(t, "hsla(23, 0%, 52%, 1, 50%)", Values.color(0, 0, 0, 0));
});

test("Can parse a short HEX color", t => {
  color(t, "#ABC", Values.color(170, 187, 204, 1));
});

test("Can parse a HEX color", t => {
  color(t, "#ABCDEF", Values.color(171, 205, 239, 1));
});

test("Can parse a medium-long HEX color in browsers that support it", t => {
  withBrowsers([["chrome", ">=", "63"], ["firefox", ">=", "49"]], () => {
    color(t, "#ABCD", Values.color(170, 187, 204, 0.8666666666666667));
  });

  withBrowsers([["firefox", "<=", "48"], ["ie", "<=", "6"]], () => {
    color(t, "#ABCD", Values.color(0, 0, 0, 0));
  });
});

test("Can parse a long HEX color", t => {
  withBrowsers([["chrome", ">=", "63"], ["firefox", ">=", "49"]], () => {
    color(t, "#ABCDEFCC", Values.color(171, 205, 239, 0.8));
  });

  withBrowsers([["firefox", "<=", "48"], ["ie", "<=", "6"]], () => {
    color(t, "#ABCDEFCC", Values.color(0, 0, 0, 0));
  });
});

test("Invalid hex colors fall back to transparent", t => {
  color(t, "#AB", Values.color(0, 0, 0, 0));
});

test("Parses transparent color", t => {
  color(t, "transparent", Values.color(0, 0, 0, 0));
});

test("Clamps values to their minimums", t => {
  color(t, "rgba(-20, -20, -20, -0.5)", Values.color(0, 0, 0, 0));
});

test("Clamps values to their maximums", t => {
  color(t, "rgba(300, 300, 300, 2)", Values.color(255, 255, 255, 1));
});
