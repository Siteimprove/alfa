import {
  Element,
  hasName,
  hasNamespace,
  Namespace,
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { and } = Predicate;

export const isDocumentElement = and(
  Element.isElement,
  and(hasName("html"), hasNamespace(Namespace.HTML))
);
