import { Element, hasName, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { isElement, hasNamespace } = Element;
const { and } = Predicate;

export const isDocumentElement = and(
  isElement,
  and(hasName("html"), hasNamespace(Namespace.HTML))
);
