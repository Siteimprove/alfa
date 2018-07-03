import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { ColorGrammar } from "../../src/grammars/color";
import { Color } from "../../src/properties/color";

function color(t: Assertions, input: string, expected: Color) {
  t.deepEqual(parse(lex(input, Alphabet), ColorGrammar), expected, input);
}

test("Can parse a named color", t =>
  color(t, "red", {
    red: 255,
    green: 0,
    blue: 0,
    alpha: 1
  }));

test("Can parse an RGB color", t =>
  color(t, "rgb(0, 50%, 100)", {
    red: 0,
    green: 127.5,
    blue: 100,
    alpha: 1
  }));

test("Can parse an RGBA color", t =>
  color(t, "rgba(0, 50%, 100, 0.5)", {
    red: 0,
    green: 127.5,
    blue: 100,
    alpha: 0.5
  }));

test("Clamps values to their minimums", t =>
  color(t, "rgba(-20, -20, -20, -0.5)", {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  }));

test("Clamps values to their maximums", t =>
  color(t, "rgba(300, 300, 300, 2)", {
    red: 255,
    green: 255,
    blue: 255,
    alpha: 1
  }));
