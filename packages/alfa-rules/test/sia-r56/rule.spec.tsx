import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { test } from "@siteimprove/alfa-test";

import R56, { Outcomes } from "../../src/sia-r56/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { and, equals } = Predicate;
const { hasName } = Element;

const device = Device.standard();

test("Passes when same landmarks have different names", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <aside aria-label="About the author" id="author" />
        <aside aria-label="About the book" id="book" />
      </html>
    ),
  ]);
  const target = document
    .descendants()
    .filter(and(Element.isElement, hasName(equals("aside"))))
    .groupBy(() => 0)
    .values();

  // const actual = await evaluate(R56, { device, document });
  // const expected = passed(R56, Iterable.first(target).get(), [
  //   { 1: Outcomes.differentNames },
  // ]);

  // console.dir(actual.map(outcome => ({...outcome, target: [...outcome.target!].map(elt => elt.attribute("id").get().value)})));
  // console.dir(expected);

  t.deepEqual(await evaluate(R56, { device, document }), [
    passed(R56, Iterable.first(target).get(), { 1: Outcomes.differentNames }),
  ]);
  t(true);
});
