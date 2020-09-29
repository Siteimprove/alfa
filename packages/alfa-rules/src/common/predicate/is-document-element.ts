import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Refinement;

export const isDocumentElement = and(
  isElement,
  and(hasName("html"), hasNamespace(Namespace.HTML))
);
