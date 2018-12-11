import {
  Document,
  Element,
  getAttribute,
  isElement
} from "@siteimprove/alfa-dom";
import { Atomic, Composite, Outcome } from "../../src/types";

export const Manual: Atomic.Rule<Document, Element> = {
  id: "_:manual-rule",
  requirements: [{ id: "wcag:page-titled", partial: true }],
  definition: (applicability, expectations, { document }) => {
    const root = document.childNodes[0];

    applicability(document, () =>
      root !== undefined && isElement(root) ? [root] : null
    );

    expectations((aspect, target, expectation, question) => {
      const hasAlt = getAttribute(target, "alt") !== "";
      const isLargeType = question(1);

      expectation(1, !hasAlt || isLargeType === true);
    });
  }
};

export const Automated: Atomic.Rule<Document, Element> = {
  id: "_:automated-rule",
  definition: (applicability, expectations, { document }) => {
    applicability(document, () => (isElement(document) ? [document] : null));

    expectations((aspect, target, expectation) => {
      const isBody = target.localName === "body";

      expectation(1, isBody);

      if (isBody) {
        expectation(2, target.prefix === null);
      }
    });
  }
};

export const Semi: Composite.Rule<Document, Element> = {
  id: "_:composite-rule",
  composes: [Manual, Automated],
  requirements: [{ id: "wcag:section-headings" }],
  definition: expectations => {
    expectations((results, expectation) => {
      expectation(1, results.some(result => result.outcome === Outcome.Passed));
    });
  }
};
