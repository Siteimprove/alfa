import { Document, isElement, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasName } from "./has-name";
import { hasNamespace } from "./has-namespace";

export function hasDocumentElement(context: Node): Predicate<Document> {
  return document =>
    Iterable.some(
      Iterable.from(document.childNodes),
      Predicate.chain(isElement)
        .and(hasName("html"))
        .and(hasNamespace(context, Namespace.HTML))
        .get()
    );
}
