import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasName } from "./has-name";
import { hasNamespace } from "./has-namespace";

const { and, equals } = Predicate;

export function isDocumentElement(context: Node): Predicate<Element> {
  return and(
    hasName(equals("html")),
    hasNamespace(context, equals(Namespace.HTML))
  );
}
