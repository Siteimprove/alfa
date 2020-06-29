import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;

export const isDocumentElement = and(
  isElement,
  and(hasName("html"), hasNamespace(Namespace.HTML))
);
