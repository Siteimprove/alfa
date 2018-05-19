import { Element, isElement, getAttribute } from "@siteimprove/alfa-dom";
import { Rule } from "../../src/types";

export const Manual: Rule<Element, "document"> = {
  id: "alfa:test:manual",
  criteria: [],
  locales: [],
  context: () => null,
  applicability: ({ document }) => {
    return isElement(document) ? document : null;
  },
  expectations: {
    1: (target, { document }, question) => {
      if (getAttribute(target, "alt") === "") {
        return true;
      }

      return question("is-large-type", target);
    }
  }
};

export const Dependencies: Rule<Element, "document"> = {
  id: "alfa:test:dependencies",
  criteria: [],
  locales: [],
  context: () => null,
  applicability: ({ document }) => {
    return isElement(document) ? [document] : [];
  },
  expectations: {
    1: (target, { document }) => {
      return false;
    },

    2: (target, { document }) => {
      return true;
    }
  }
};
