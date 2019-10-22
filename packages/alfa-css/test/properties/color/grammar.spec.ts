import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { ColorGrammar } from "../../../src/properties/color/grammar";
import { Color } from "../../../src/properties/color/types";
import { Values } from "../../../src/values";

const { string, func, number, percentage, keyword } = Values;

function color(t: Assertions, input: string, expected: Color | null) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, ColorGrammar);

  t.deepEqual(parser.result, expected, input);
}

test("Can parse a named color", t => {
  color(t, "red", string("red"));
});

test("Can parse a RGB color", t => {
  color(
    t,
    "rgb(0, 50%, 100)",
    func("rgb", [number(0), percentage(0.5), number(100)])
  );
});

test("Can parse a RGBA color", t => {
  color(
    t,
    "rgba(0, 50%, 100, 0.5)",
    func("rgb", [number(0), percentage(0.5), number(100), number(0.5)])
  );
});

test("Can parse an HSL color", t => {
  color(
    t,
    "hsl(225, 55%, 26%)",
    func("hsl", [number(225), percentage(0.55), percentage(0.26)])
  );
});

test("Can parse a HSLA color", t => {
  color(
    t,
    "hsla(3, 55%, 26%, 0.5)",
    func("hsl", [number(3), percentage(0.55), percentage(0.26), number(0.5)])
  );
});

test("Can parse an achromatic HSL color", t => {
  color(
    t,
    "hsl(23, 0%, 26%)",
    func("hsl", [number(23), percentage(0), percentage(0.26)])
  );
});

test("Can not parse a HSLA color with wrong paramter type", t => {
  color(t, "hsla(23%, 0%, 26%, 1)", null);
  color(t, "hsla(23, 0, 26%, 1)", null);
  color(t, "hsla(23, 0%, 26, 1)", null);
  color(t, "hsla(23, 0%, 26%, 40%)", null);
});

test("Can not parse a HSLA color with wrong paramter size", t => {
  color(t, "hsla(23, 0%)", null);
  color(t, "hsla(23, 0%, 52%, 1, 50%)", null);
});

test("Can parse a hex color", t => {
  color(t, "#abcdef", number(0xabcdefff));
});

test("Can parse a short hex color", t => {
  color(t, "#abc", number(0xaabbccff));
});

test("Can parse a medium hex color", t => {
  color(t, "#abcd", number(0xaabbccdd));
});

test("Can parse a long hex color", t => {
  color(t, "#abcdefcc", number(0xabcdefcc));
});

test("Can parse the transparent color", t => {
  color(t, "transparent", keyword("transparent"));
});
