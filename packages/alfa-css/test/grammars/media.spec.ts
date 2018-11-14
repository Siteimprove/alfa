import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { MediaGrammar } from "../../src/grammars/media";
import { MediaQuery } from "../../src/types";
import { Values } from "../../src/values";

function media(t: Assertions, input: string, expected: MediaQuery) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, MediaGrammar);

  t.deepEqual(parser.result, expected, input);
  t(parser.done);
}

test("Can parse a media type", t => {
  media(t, "screen", { type: "screen" });
});

test("Can parse a media feature with a length value", t => {
  media(t, "(feature: 200px)", {
    condition: {
      feature: {
        name: "feature",
        value: Values.length(200, "px")
      }
    }
  });
});

test("Can parse a media feature with a number value", t => {
  media(t, "(feature: 200)", {
    condition: {
      feature: {
        name: "feature",
        value: Values.number(200)
      }
    }
  });
});

test("Can parse a media feature with a string value", t => {
  media(t, "(feature: foo)", {
    condition: {
      feature: {
        name: "feature",
        value: Values.string("foo")
      }
    }
  });
});

test("Can parse a media feature without a value", t => {
  media(t, "(feature)", {
    condition: {
      feature: {
        name: "feature"
      }
    }
  });
});
