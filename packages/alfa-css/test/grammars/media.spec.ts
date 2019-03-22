import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { MediaGrammar } from "../../src/grammars/media";
import { MediaOperator, MediaQuery } from "../../src/types";
import { Values } from "../../src/values";

function media(
  t: Assertions,
  input: string,
  expected: MediaQuery | Array<MediaQuery>
) {
  const lexer = lex(input, Alphabet);
  const parser = parse(lexer.result, MediaGrammar);

  t.deepEqual(parser.result, expected, input);
  t(parser.done);
}

test("Can parse a media type", t => {
  media(t, "type", { type: "type" });
});

test("Can parse a media feature with a length value", t => {
  media(t, "(feature: 200px)", {
    condition: {
      features: [
        {
          name: "feature",
          value: Values.length(200, "px")
        }
      ]
    }
  });
});

test("Can parse a media feature with a number value", t => {
  media(t, "(feature: 200)", {
    condition: {
      features: [
        {
          name: "feature",
          value: Values.number(200)
        }
      ]
    }
  });
});

test("Can parse a media feature with a string value", t => {
  media(t, "(feature: foo)", {
    condition: {
      features: [
        {
          name: "feature",
          value: Values.string("foo")
        }
      ]
    }
  });
});

test("Can parse a media feature without a value", t => {
  media(t, "(feature)", {
    condition: {
      features: [{ name: "feature" }]
    }
  });
});

test("Can parse a media type and feature", t => {
  media(t, "type and (feature)", {
    type: "type",
    condition: {
      features: [{ name: "feature" }]
    }
  });
});

test("Can parse a list of media types and a feature", t => {
  media(t, "typeA, typeB and (feature)", [
    {
      type: "typeA"
    },
    {
      type: "typeB",
      condition: {
        features: [{ name: "feature" }]
      }
    }
  ]);
});

test("Can parse multiple media features separated by and", t => {
  media(t, "(foo) and (bar)", {
    condition: {
      operator: MediaOperator.And,
      features: [{ name: "foo" }, { name: "bar" }]
    }
  });
});

test("Can parse multiple media features separated by or", t => {
  media(t, "(foo) or (bar)", {
    condition: {
      operator: MediaOperator.Or,
      features: [{ name: "foo" }, { name: "bar" }]
    }
  });
});

test("Can parse multiple media features separated by both and / or", t => {
  media(t, "(foo) and ((bar) or (baz))", {
    condition: {
      operator: MediaOperator.And,
      features: [
        { name: "foo" },
        {
          operator: MediaOperator.Or,
          features: [{ name: "bar" }, { name: "baz" }]
        }
      ]
    }
  });
});
