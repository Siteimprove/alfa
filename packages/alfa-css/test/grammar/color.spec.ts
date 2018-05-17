import { test, Test } from "@siteimprove/alfa-test";
import { parse, lex } from "@siteimprove/alfa-lang";
import { Alphabet } from "../../src/alphabet";
import { Color } from "../../src/property/color";
import { ColorGrammar } from "../../src/grammar/color";

async function color(t: Test, input: string, expected: Color) {
  t.deepEqual(parse(lex(input, Alphabet), ColorGrammar), expected, t.title);
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
