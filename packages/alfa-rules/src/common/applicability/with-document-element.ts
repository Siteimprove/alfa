import { type Document, Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { None, Option } from "@siteimprove/alfa-option";

const { fold } = Predicate;
const { and } = Refinement;

/**
 * Returns the document if it has an `<html>` child verifying the predicate.
 *
 * @internal
 */
export const withDocumentElement = (
  document: Document,
  predicate: Predicate<Element> = () => true
) =>
  fold(
    Node.hasChild(and(Element.isDocumentElement, predicate)),
    () => Option.of(document),
    () => None,
    document
  );
