import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../../src/alphabet";
import { TextIndentGrammar } from "../../../src/properties/text-indent/grammar";
import { TextIndent } from "../../../src/properties/text-indent/types";
import { Values } from "../../../src/values";

const { boolean, dictionary, length, percentage } = Values;

function textIndent(t: Assertions, input: string, expected: TextIndent | null) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, TextIndentGrammar);

  if (expected === null) {
    t(parser.result === null || !parser.done);
  } else {
    t.deepEqual(parser.result, expected, input);
  }
}

test("Can parse an absolute indent in px", t => {
  textIndent(t, "7px", dictionary({ indent: length(7, "px") }));
});

test("Can parse a relative indent in percentage", t => {
  textIndent(t, "25%", dictionary({ indent: percentage(0.25) }));
});

test("Can parse a relative indent in em", t => {
  textIndent(t, "2.5em", dictionary({ indent: length(2.5, "em") }));
});

test("Can parse a absolute hanging indent", t => {
  textIndent(
    t,
    "7px hanging",
    dictionary({
      indent: length(7, "px"),
      hanging: boolean(true)
    })
  );
});

test("Can parse a relative hanging indent in percentage", t => {
  textIndent(
    t,
    "7% hanging",
    dictionary({
      indent: percentage(0.07),
      hanging: boolean(true)
    })
  );
});

test("Can parse a relative hanging indent in em", t => {
  textIndent(
    t,
    "7em hanging",
    dictionary({
      indent: length(7, "em"),
      hanging: boolean(true)
    })
  );
});

test("Can parse a absolute-hanging-eachline indent", t => {
  textIndent(
    t,
    "7px hanging each-line",
    dictionary({
      indent: length(7, "px"),
      hanging: boolean(true),
      eachLine: boolean(true)
    })
  );
});

test("Can parse a absolute-eachline indent", t => {
  textIndent(
    t,
    "7px each-line",
    dictionary({
      indent: length(7, "px"),
      eachLine: boolean(true)
    })
  );
});

test("Does not accept repeated keywords", t => {
  textIndent(t, "7px hanging hanging", null);
  textIndent(t, "7em hanging hanging", null);
});

test("Does not accept incorrectly ordered keywords", t => {
  textIndent(t, "7px each-line hanging", null);
  textIndent(t, "7em each-line hanging", null);
});
