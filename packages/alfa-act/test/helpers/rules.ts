import { Element, getAttribute, isElement } from "@siteimprove/alfa-dom";
import { Rule } from "../../src/types";

export const Manual: Rule<"document", Element> = {
  id: "alfa:test:manual",
  definition: (applicability, expectations, { document }) => {
    applicability(() => (isElement(document) ? document : null));

    expectations((target, expectation, question) => {
      const hasAlt = getAttribute(target, "alt") !== "";
      const isLargeType = question("is-large-type");

      expectation(1, !hasAlt || isLargeType);
    });
  }
};

export const Dependencies: Rule<"document", Element> = {
  id: "alfa:test:dependencies",
  definition: (applicability, expectations, { document }) => {
    applicability(() => (isElement(document) ? document : null));

    expectations((target, expectation) => {
      const isBody = target.localName === "body";

      expectation(1, isBody);

      if (isBody) {
        expectation(2, target.prefix === null);
      }
    });
  }
};
