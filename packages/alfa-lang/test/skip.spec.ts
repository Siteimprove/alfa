import { test } from "@siteimprove/alfa-test";
import { skip } from "../src/skip";
import { Stream } from "../src/stream";
import { Command, Expression } from "../src/types";

test("Prefix returns Continue", t => {
  const number = "F".charCodeAt(0);
  const obj = skip(number);

  if (obj.prefix === undefined) {
    t.fail("Skip is missing a prefix method");
    return;
  }

  const type = { type: 0 };
  const stream = new Stream(0, () => ({ type: 0 }));
  const expression = () => null;

  t.equal(obj.prefix(type, stream, expression, null), Command.Continue);
});

test("Infix returns Continue", t => {
  const number = "F".charCodeAt(0);
  const obj = skip(number);

  if (obj.infix === undefined) {
    t.fail("Skip is missing a infix method");
    return;
  }

  const type = { type: number };
  const stream = new Stream<{ type: number }>(0, () => ({ type: 0 }));
  const expression: Expression<number> = () => 0;

  t.equal(obj.infix(type, stream, expression, null, null), Command.Continue);
});
