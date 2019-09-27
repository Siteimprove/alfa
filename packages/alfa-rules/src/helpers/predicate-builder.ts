import { getRole, Role } from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  getElementNamespace,
  getInputType,
  InputType,
  isElement as isElt,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-util";

class PredicateBuilder<T, U extends T = T> {
  public readonly predicate: Predicate<T, U>;

  public constructor(predicate: Predicate<T, U> = () => true) {
    this.predicate = predicate;
  }

  public and<V extends U = U>(
    predicate: Predicate<U, V>
  ): PredicateBuilder<T, V> {
    return new PredicateBuilder(v => this.predicate(v) && predicate(v));
  }
}

class NodePredicateBuilder<T extends Node = Node> extends PredicateBuilder<
  Node,
  T
> {
  public isElement(): ElementPredicateBuilder {
    return new ElementPredicateBuilder(node => {
      return this.and(isElt).predicate(node);
    });
  }
}

class ElementPredicateBuilder<
  T extends Element = Element
> extends NodePredicateBuilder<T> {
  public and<T extends Element = Element>(
    predicate: Predicate<Element, T>
  ): ElementPredicateBuilder {
    return new ElementPredicateBuilder<T>(
      element => this.predicate(element) && predicate(element)
    );
  }

  public withName(...names: Array<string>): ElementPredicateBuilder {
    return this.and(element => names.some(name => name === element.localName));
  }

  public withInputType(
    ...inputTypes: Array<InputType>
  ): ElementPredicateBuilder {
    return this.and(element =>
      inputTypes.some(inputType => inputType === getInputType(element))
    );
  }

  public withNamespace(
    context: Node,
    ...namespaces: Array<Namespace>
  ): ElementPredicateBuilder {
    return this.and(element =>
      namespaces.some(
        namespace => namespace === getElementNamespace(element, context)
      )
    );
  }

  public withRole(
    device: Device,
    context: Node,
    ...roles: Array<Role>
  ): BrowserSpecificPredicateBuilder<Node> {
    return new BrowserSpecificPredicateBuilder(node =>
      this.predicate(node) // node must be narrowed to Element before calling getRole
        ? BrowserSpecific.map(getRole(node, context, device), elementRole =>
            roles.some(role => role === elementRole)
          )
        : false
    );
  }
}

type BrowserSpecificPredicate<T> = (t: T) => boolean | BrowserSpecific<boolean>;

class BrowserSpecificPredicateBuilder<T> {
  public readonly predicate: BrowserSpecificPredicate<T>;

  public constructor(predicate: BrowserSpecificPredicate<T> = () => true) {
    this.predicate = predicate;
  }

  public and(
    predicate: BrowserSpecificPredicate<T>
  ): BrowserSpecificPredicateBuilder<T> {
    return new BrowserSpecificPredicateBuilder((t: T) =>
      BrowserSpecific.map(predicate(t), b => b && this.predicate(t))
    );
  }
}

/*
function isNode<T extends Node = Node>(
  factory: (builder: NodePredicateBuilder) => NodePredicateBuilder<T>
): Predicate<Node, T>;

function isNode(
  factory: (builder: NodePredicateBuilder) => BrowserSpecificPredicateBuilder<Node>
): BrowserSpecificPredicate<Node>;

function isNode<T extends Node>(
  factory: (
    builder: NodePredicateBuilder
  ) => NodePredicateBuilder<T> | BrowserSpecificPredicateBuilder<Node> = builder => builder
): Predicate<Node, T> | BrowserSpecificPredicate<Node> {
  return node => factory(new NodePredicateBuilder()).predicate(node);
}
*/

export function isElement<T extends Element = Element>(
  factory: (builder: ElementPredicateBuilder) => ElementPredicateBuilder<T>
): Predicate<Node, T>;

export function isElement(
  factory: (
    builder: ElementPredicateBuilder
  ) => BrowserSpecificPredicateBuilder<Node>
): BrowserSpecificPredicate<Node>;

export function isElement(
  factory: (
    builder: ElementPredicateBuilder
  ) =>
    | ElementPredicateBuilder
    | BrowserSpecificPredicateBuilder<Node> = builder => builder
): Predicate<Node, Element> | BrowserSpecificPredicate<Node> {
  return node =>
    factory(new NodePredicateBuilder().isElement()).predicate(node);
}
