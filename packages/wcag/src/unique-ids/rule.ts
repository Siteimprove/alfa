import { Rule, Applicability, Expectation } from "@alfa/rule";
import { Element, collect, attribute, isElement } from "@alfa/dom";

import EN from "./locale/en";

const elementsWithIds: Applicability<Element, "document"> = async ({
  document
}) => {
  return collect(document)
    .where(isElement)
    .where(element => "id" in element.attributes)
    .where(element => attribute(element, "id") !== "");
};

const elementIdIsUnique: Expectation<Element, "document"> = async (
  target,
  { document }
) => {
  return (
    collect(document)
      .where(isElement)
      .where(element => element !== target)
      .where(element => attribute(element, "id") === attribute(target, "id"))
      .first() === null
  );
};

export const UNIQUE_IDS: Rule<Element, "document"> = {
  id: "alfa:wcag:unique-ids",
  criteria: ["wcag:4.1.1"],
  locales: [EN],
  applicability: elementsWithIds,
  expectations: {elementIdIsUnique}
};
