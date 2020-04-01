import { None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import { Attribute } from "../../src";
import { parseAttribute } from "../../src/tables/helpers";

const makeAttribute = (str: string) => Attribute.of(None, None, "dummy", str);

const tooShort = Err.of("too short");
const parser: Parser<string, number, string> = (str) =>
  str.length < 3 ? tooShort : Ok.of(["", str.length] as const);

test("parse attributes", (t) => {
  t.deepEqual(parseAttribute(parser)(makeAttribute("12345")), Ok.of(5));
  t.deepEqual(parseAttribute(parser)(makeAttribute("")), tooShort);
});
