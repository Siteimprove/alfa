import { Role } from "@siteimprove/alfa-aria";
import * as aria from "@siteimprove/alfa-aria";
import { BrowserSpecific, Predicate } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, InputType, Namespace, Node } from "@siteimprove/alfa-dom";
import * as dom from "@siteimprove/alfa-dom";

const { map } = BrowserSpecific;

export const isElement = Predicate.Builder.of<Node, Element>(dom.isElement);

export const isText = Predicate.Builder.of<Node, Text>(dom.isText);

export const isDocument = Predicate.Builder.of<Node, Document>(dom.isDocument);

export function nameIs(...names: Array<string>): Predicate.Builder<Element> {
  return Predicate.Builder.of(element =>
    names.some(name => name === element.localName)
  );
}

export function inputTypeIs(
  ...inputTypes: Array<InputType>
): Predicate.Builder<Element> {
  return Predicate.Builder.of(element =>
    inputTypes.some(inputType => inputType === dom.getInputType(element))
  );
}

export function namespaceIs(
  context: Node,
  ...namespaces: Array<Namespace>
): Predicate.Builder<Element> {
  return Predicate.Builder.of(element =>
    namespaces.some(
      namespace => namespace === dom.getElementNamespace(element, context)
    )
  );
}

export function roleIs(
  context: Node,
  device: Device,
  ...roles: Array<Role>
): Predicate.Builder<Element, Element, BrowserSpecific.Maybe<boolean>> {
  return Predicate.Builder.of(element =>
    map(aria.getRole(element, context, device), elementRole =>
      roles.some(role => role === elementRole)
    )
  );
}
