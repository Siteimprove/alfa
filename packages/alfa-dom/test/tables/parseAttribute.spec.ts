import {test} from "@siteimprove/alfa-test";
import {None, Some} from "@siteimprove/alfa-option";
import {Attribute, parseAttribute, parseInteger, parseNonNegativeInteger} from "../../src";

const makeAttribute = (str: string) => Attribute.of(None, None, "foo", str);

test("parse integer attributes", t => {
  t.deepEqual(parseAttribute(parseInteger)(makeAttribute("5")), Some.of(5));
  t.deepEqual(parseAttribute(parseInteger)(makeAttribute("-8")), Some.of(-8));
  t.deepEqual(parseAttribute(parseNonNegativeInteger)(makeAttribute("5")), Some.of(5));

  t.equal(parseAttribute(parseNonNegativeInteger)(makeAttribute("-8")), None);
  t.equal(parseAttribute(parseInteger)(makeAttribute("5.2")), None);
  t.equal(parseAttribute(parseInteger)(makeAttribute("snnsr")), None);
});
