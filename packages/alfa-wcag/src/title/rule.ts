import { Rule } from "@siteimprove/alfa-act";
import {
  Element,
  Namespace,
  isElement,
  querySelector,
  getElementNamespace,
  hasTextContent
} from "@siteimprove/alfa-dom";

export type Context = Readonly<{ root: Element | null; title: Element | null }>;

export const Title: Rule<"document", Element, Context> = {
  id: "alfa:wcag:title",
  criteria: ["wcag:2.4.2"],
  locales: [],
  context: ({ document }) => {
    const root = querySelector(document, document, "html");

    if (root === null) {
      return { root, title: null };
    }

    const title = querySelector<Element>(
      root,
      document,
      node =>
        isElement(node) &&
        node.localName === "title" &&
        getElementNamespace(node, document) === Namespace.HTML
    );

    return { root, title };
  },
  applicability: (aspects, context) => {
    return context.root;
  },
  expectations: {
    1: (root, aspects, question, { title }) => {
      return title !== null;
    },
    2: (root, aspects, question, { title }) => {
      return title !== null && hasTextContent(title);
    }
  }
};
