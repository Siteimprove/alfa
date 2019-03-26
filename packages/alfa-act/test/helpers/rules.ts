import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  isElement
} from "@siteimprove/alfa-dom";
import { Atomic, Composite, Outcome, QuestionType } from "../../src/types";

export const Manual: Atomic.Rule<Document | Device, Element> = {
  id: "_:manual-rule",
  requirements: [{ id: "wcag:page-titled", partial: true }],
  evaluate: ({ document }) => {
    const root = document.childNodes[0];

    return {
      applicability: () => {
        return root !== undefined && isElement(root)
          ? [{ applicable: true, target: root, aspect: document }]
          : [];
      },

      expectations: (aspect, target, question) => {
        const hasAlt = getAttribute(target, "alt") !== "";
        const isLargeType = question(QuestionType.Boolean, "is-large-type");

        return {
          1: { holds: !hasAlt || isLargeType === true }
        };
      }
    };
  }
};

export const Automated: Atomic.Rule<Document, Element> = {
  id: "_:automated-rule",
  evaluate: ({ document }) => {
    return {
      applicability: () => {
        return isElement(document)
          ? [{ applicable: true, target: document, aspect: document }]
          : [];
      },

      expectations: (aspect, target) => {
        const isBody = target.localName === "body";

        return {
          1: { holds: isBody },
          2: { holds: isBody && target.prefix === null }
        };
      }
    };
  }
};

export const Semi: Composite.Rule<Document | Device, Element> = {
  id: "_:composite-rule",
  requirements: [{ id: "wcag:section-headings" }],
  compose: composition => {
    composition.add(Manual).add(Automated);
  },
  evaluate: () => {
    return {
      expectations: results => {
        return {
          1: {
            holds: results.some(result => result.outcome === Outcome.Passed)
          }
        };
      }
    };
  }
};
