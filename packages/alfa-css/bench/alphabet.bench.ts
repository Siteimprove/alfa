import { benchmark } from "@siteimprove/alfa-bench";
import { lex } from "@siteimprove/alfa-lang";
import { Alphabet } from "../src/alphabet";

benchmark()
  .add("Lex an ID", () => {
    lex("#foo", Alphabet);
  })
  .add("Lex a class", () => {
    lex(".foo", Alphabet);
  })
  .add("Lex a type", () => {
    lex("foo", Alphabet);
  })
  .add("Lex an attribute", () => {
    lex("[foo]", Alphabet);
  })
  .run();
