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

    applicability(document, () => {
      return root !== undefined && isElement(root) ? [root] : null;
    });

    expectations((aspect, target, question) => {
      const hasAlt = getAttribute(target, "alt") !== "";
      const isLargeType = question(1);

      return {
        1: { holds: !hasAlt || isLargeType === true }
      };
    });
  }
};

export const Automated: Atomic.Rule<Document, Element> = {
  id: "_:automated-rule",
  definition: (applicability, expectations, { document }) => {
    applicability(document, () => {
      return isElement(document) ? [document] : null;
    });

    expectations((aspect, target) => {
      const isBody = target.localName === "body";

      return {
        1: { holds: isBody },
        2: { holds: isBody && target.prefix === null }
      };
    });
  }
};

export const Semi: Composite.Rule<Document, Element> = {
  id: "_:composite-rule",
  composes: [Manual, Automated],
  requirements: [{ id: "wcag:section-headings" }],
  definition: expectations => {
    expectations(results => {
      return {
        1: { holds: results.some(result => result.outcome === Outcome.Passed) }
      };
    });
  }
};
