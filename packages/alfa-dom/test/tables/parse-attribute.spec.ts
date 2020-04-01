import { Map } from "@siteimprove/alfa-map";
import { None, Some } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import { Attribute, Element } from "../../src";
import {
  EnumeratedValueError,
  parseAttribute,
  parseEnumeratedAttribute,
} from "../../src/tables/helpers";

const makeAttribute = (str: string) => Attribute.of(None, None, "dummy", str);

const tooShort = Err.of("too short");
const parser: Parser<string, number, string> = (str) =>
  str.length < 3 ? tooShort : Ok.of(["", str.length] as const);

test("parse attributes", (t) => {
  t.deepEqual(parseAttribute(parser)(makeAttribute("12345")), Ok.of(5));
  t.deepEqual(parseAttribute(parser)(makeAttribute("")), tooShort);
});

test("parse enumerated attribute according to specs", (t) => {
  function enumerated(value: string): Element {
    return Element.of(None, None, "dummy", (elt) => [
      Attribute.of(None, None, "enumerated", value),
    ]);
  }
  const noenum = Element.of(None, None, "dummy");
  const noDefault = Map.from([
    ["foo", 1],
    ["bar", 2],
  ]);
  const withDefault = Map.from([
    ["foo", 1],
    ["bar", 2],
    [EnumeratedValueError.Missing, 0],
    [EnumeratedValueError.Invalid, 42],
  ]);

  const parserNoDefault = parseEnumeratedAttribute("enumerated", noDefault);
  const parserWithDefault = parseEnumeratedAttribute("enumerated", withDefault);

  t.deepEqual(parserNoDefault(enumerated("Foo")), Some.of(1));
  t.deepEqual(parserNoDefault(enumerated("this is totally invalid")), None);
  t.deepEqual(parserNoDefault(noenum), None);

  t.deepEqual(parserWithDefault(enumerated("bAR")), Some.of(2));
  t.deepEqual(
    parserWithDefault(enumerated("this is totally invalid")),
    Some.of(42)
  );
  t.deepEqual(parserWithDefault(noenum), Some.of(0));
});
