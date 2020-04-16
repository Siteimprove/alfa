import { None, Some } from "@siteimprove/alfa-option";
import { Err, Ok } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";
import { Attribute, Element } from "../../src";

const { EnumeratedAttributeError } = Attribute;

test("parse enumerated attribute according to specs", (t) => {
  function enumerated(value: string): Element {
    return Element.of(None, None, "dummy", (elt) => [
      Attribute.of(None, None, "enumerated", value),
    ]);
  }
  const noenum = Element.of(None, None, "dummy");

  t.deepEqual(
    enumerated("Foo").enumerateAttribute("enumerated", "foo", "bar"),
    Ok.of("foo")
  );

  t.deepEqual(
    enumerated("bAR").enumerateAttribute("enumerated", "foo", "bar"),
    Ok.of("bar")
  );

  t.deepEqual(
    enumerated("this is totally invalid").enumerateAttribute(
      "enumerated",
      "foo",
      "bar"
    ),
    Err.of(EnumeratedAttributeError.Invalid)
  );

  t.deepEqual(
    enumerated(" foo").enumerateAttribute("enumerated", "foo", "bar"),
    Err.of(EnumeratedAttributeError.Invalid)
  );

  t.deepEqual(
    noenum.enumerateAttribute("enumerated", "foo", "bar"),
    Err.of(EnumeratedAttributeError.Missing)
  );
});
