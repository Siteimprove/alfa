import { Rule } from "@siteimprove/alfa-act";
import {
  Element,
  Namespace,
  isElement,
  find,
  getNamespace,
  hasTextContent
} from "@siteimprove/alfa-dom";

export type Context = Readonly<{ root: Element | null; title: Element | null }>;

export const Title: Rule<Element, "document", Context> = {
  id: "alfa:wcag:title",
  criteria: ["wcag:2.4.2"],
  locales: [],
  context: ({ document }) => {
    const root = find(document, document, "html");

    if (root === null) {
      return { root, title: null };
    }

    const title = find<Element>(
      root,
      document,
      node =>
        isElement(node) &&
        node.localName === "title" &&
        getNamespace(node, document) === Namespace.HTML
    );

    return { root, title };
  },
  applicability: async (aspects, context) => {
    return context.root ? [context.root] : [];
  },
  expectations: {
    1: async (root, aspects, question, { title }) => {
      return title !== null;
    },
    2: async (root, aspects, question, { title }) => {
      return title !== null && hasTextContent(title);
    }
  }
};
