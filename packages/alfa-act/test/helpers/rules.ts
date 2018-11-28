import {
  Document,
  Element,
  getAttribute,
  isElement
} from "@siteimprove/alfa-dom";
import { Atomic, Composite } from "../../src/types";

export const Manual: Atomic.Rule<Document, Element> = {
  id: "_:manual-rule",
  requirements: [{ id: "wcag:page-titled", partial: true }],
  definition: (applicability, expectations, { document }) => {
    const root = document.childNodes[0];

    applicability(() =>
      root !== undefined && isElement(root) ? [root] : null
    );

    expectations((target, expectation, question) => {
      const hasAlt = getAttribute(target, "alt") !== "";
      const isLargeType = question("is-large-type");

      expectation(1, !hasAlt || isLargeType);
    });
  }
};

export const Automated: Atomic.Rule<Document, Element> = {
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

export const Semi: Composite.Rule<Document, Element> = {
  id: "_:composite-rule",
  composes: [Manual, Automated],
  requirements: [{ id: "wcag:section-headings" }],
  definition: expectations => {
    expectations((results, expectation) => {
      expectation(1, results.some(result => result.outcome === "passed"));
    });
  }
};
