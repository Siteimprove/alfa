import {
  Element,
  hasName,
  hasNamespace,
  Namespace,
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { and, equals } = Predicate;

export function isDocumentElement(): Predicate<Element> {
  return and(hasName(equals("html")), hasNamespace(equals(Namespace.HTML)));
}
