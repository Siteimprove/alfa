import { Element, getAttribute, isElement } from "@siteimprove/alfa-dom";
import { Atomic, Composite } from "../../src/types";

export const Manual: Atomic.Rule<"document", Element> = {
  id: "_:manual-rule",
  requirements: ["https://www.w3.org/TR/WCAG/#page-titled"],
  definition: (applicability, expectations, { document }) => {
    applicability(() => (isElement(document) ? [document] : null));

    expectations((target, expectation, question) => {
      const hasAlt = getAttribute(target, "alt") !== "";
      const isLargeType = question("is-large-type");

      expectation(1, !hasAlt || isLargeType);
    });
  }
};

export const Automated: Atomic.Rule<"document", Element> = {
  id: "_:automated-rule",
  definition: (applicability, expectations, { document }) => {
    applicability(() => (isElement(document) ? [document] : null));

    expectations((target, expectation) => {
      const isBody = target.localName === "body";

      expectation(1, isBody);

      if (isBody) {
        expectation(2, target.prefix === null);
      }
    });
  }
};

export const Semi: Composite.Rule<"document", Element> = {
  id: "_:composite-rule",
  composes: [Manual, Automated],
  requirements: ["https://www.w3.org/TR/WCAG/#section-headings"],
  definition: expectations => {
    expectations((results, expectation) => {
      expectation(1, results.some(result => result.outcome === "passed"));
    });
  }
};
