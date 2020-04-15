import {None, Some} from "@siteimprove/alfa-option";
import {test} from "@siteimprove/alfa-test";
import {Attribute, Element} from "../../src";

const { EnumeratedAttributeError } = Element;

test("parse enumerated attribute according to specs", (t) => {
  function enumerated(value: string): Element {
    return Element.of(None, None, "dummy", (elt) => [
      Attribute.of(None, None, "enumerated", value),
    ]);
  }
  const noenum = Element.of(None, None, "dummy");

  t.deepEqual(enumerated("Foo").enumerateAttribute("enumerated", "foo", "bar"), "foo");
  t.deepEqual(enumerated("bAR").enumerateAttribute("enumerated", "foo", "bar"), "bar");
  t.deepEqual(enumerated("this is totally invalid").enumerateAttribute("enumerated", "foo", "bar"), EnumeratedAttributeError.Invalid);
  t.deepEqual(enumerated(" foo").enumerateAttribute("enumerated", "foo", "bar"), EnumeratedAttributeError.Invalid);
  t.deepEqual(noenum.enumerateAttribute("enumerated", "foo", "bar"), EnumeratedAttributeError.Missing);
});
