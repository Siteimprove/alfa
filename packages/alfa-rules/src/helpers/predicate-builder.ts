/*
import { getRole, Role } from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
*/
import {
  Element,
  getElementNamespace,
  getInputType,
  InputType,
  isElement as isElt,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { Option, Predicate } from "@siteimprove/alfa-util";

function member<T>(elt: Option<T>, arr: Array<T>): boolean {
  return elt !== null && new Set(arr).has(elt);
}

class NodePredicateBuilder<T extends Node = Node> {
  public readonly predicate: Predicate<Node, T>;

  public constructor(predicate: Predicate<Node, T> = () => true) {
    this.predicate = predicate;
  }

  public and<U extends T = T>(
    predicate: Predicate<T, U>
  ): NodePredicateBuilder<U> {
    return new NodePredicateBuilder(
      node => this.predicate(node) && predicate(node)
    );
  }

  public isElement(): ElementPredicateBuilder {
    return new ElementPredicateBuilder(node => {
      return this.predicate(node) && isElt(node);
    });
  }
}

class ElementPredicateBuilder<
  T extends Element = Element
> extends NodePredicateBuilder<T> {
  public and<T extends Element = Element>(
    predicate: Predicate<Element, T>
  ): ElementPredicateBuilder {
    return new ElementPredicateBuilder(
      element => this.predicate(element) && predicate(element)
    );
  }

  public withName(...names: Array<string>): ElementPredicateBuilder {
    return this.and(element => member(element.localName, names));
  }

  public withInputType(
    ...inputTypes: Array<InputType>
  ): ElementPredicateBuilder {
    return this.and(element => member(getInputType(element), inputTypes));
  }

  public withNamespace(
    context: Node,
    ...namespaces: Array<Namespace>
  ): ElementPredicateBuilder {
    return this.and(element =>
      member(getElementNamespace(element, context), namespaces)
    );
  }

  /*
  public withRole(device: Device, context: Node, role: Role): BrowserSpecific<ElementPredicateBuilder> | ElementPredicateBuilder {
    const foo = (element: Element) => {
      return BrowserSpecific.map(getRole(element, context, device) === role, b => this.predicate(element) && b)
    }

    return new ElementPredicateBuilder(foo)
  } 
  */
}

export function isNode<T extends Node>(
  factory: (
    builder: NodePredicateBuilder
  ) => NodePredicateBuilder<T> = builder => builder
): Predicate<Node, T> {
  return node => factory(new NodePredicateBuilder()).predicate(node);
}

export function isElement(
  factory: (
    builder: ElementPredicateBuilder
  ) => ElementPredicateBuilder = builder => builder
): Predicate<Node, Element> {
  return isNode<Element>(builder => factory(builder.isElement()));
}
