import {Err, Ok} from "@siteimprove/alfa-result";
import {test} from "@siteimprove/alfa-test";
import {None, Some} from "@siteimprove/alfa-option";
import {Attribute, parseAttribute, parseInteger, parseNonNegativeInteger} from "../../src";

const makeAttribute = (str: string) => Attribute.of(None, None, "foo", str);

const empty = Err.of("The string is empty");
const notNumber = Err.of("The string does not represent a number");
const notInteger = Err.of("The string does not represent an integer");
const negative = Err.of("This is a negative number");

test("parse integer attributes", t => {
  t.deepEqual(parseAttribute(parseInteger)(makeAttribute("5")), Ok.of(5));
  t.deepEqual(parseAttribute(parseInteger)(makeAttribute("-8")), Ok.of(-8));
  t.deepEqual(parseAttribute(parseNonNegativeInteger)(makeAttribute("5")), Ok.of(5));

  t.deepEqual(parseAttribute(parseInteger)(makeAttribute("")), empty);
  t.deepEqual(parseAttribute(parseInteger)(makeAttribute("snnsr")), notNumber);
  t.deepEqual(parseAttribute(parseInteger)(makeAttribute("5.2")), notInteger);
  t.deepEqual(parseAttribute(parseNonNegativeInteger)(makeAttribute("-8")), negative);
});
