import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import R73, { Outcomes } from "../../src/sia-r73/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { and } = Predicate;
const { isElement, hasName } = Element;

test("evaluate() passes a paragraph whose line height is at least 1.5", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <html>
        <p style="line-height: 1.5">Hello world</p>
      </html>,
      Option.of(self)
    ),
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("p")))
    .get();

  t.deepEqual(await evaluate(R73, { document }), [
    passed(R73, target, {
      1: Outcomes.IsSufficient,
    }),
  ]);
});
