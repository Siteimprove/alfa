import { Rule } from "@alfa/rule";
import { Element, collect, getAttribute, isElement } from "@alfa/dom";

import EN from "./locale/en";

export const UNIQUE_IDS: Rule<Element, "document"> = {
  id: "alfa:wcag:unique-ids",
  criteria: ["wcag:4.1.1"],
  locales: [EN],
  applicability: async ({ document }) => {
    return collect(document)
      .where(isElement)
      .where(element => {
        const id = getAttribute(element, "id");
        return id !== undefined && id !== "";
      });
  },
  expectations: {
    1: async (target, { document }) => {
      return (
        collect(document)
          .where(isElement)
          .where(
            element =>
              element !== target &&
              getAttribute(element, "id") === getAttribute(target, "id")
          )
          .first() === null
      );
    }
  }
};
