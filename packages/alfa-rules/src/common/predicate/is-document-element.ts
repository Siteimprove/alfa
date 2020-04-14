import {
  Element,
  hasName,
  hasNamespace,
  Namespace,
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { and, equals } = Predicate;

export const isDocumentElement = and(
  Element.isElement,
  and(hasName(equals("html")), hasNamespace(equals(Namespace.HTML)))
);
