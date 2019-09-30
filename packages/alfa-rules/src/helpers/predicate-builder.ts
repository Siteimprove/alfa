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

class NodePredicateBuilder<U extends Node = Node> extends PredicateBuilder<
  Node,
  U
> {
  public isElement(): ElementPredicateBuilder {
    return new ElementPredicateBuilder(node => {
      return this.and(isElt).predicate(node);
    });
  }
}

class ElementPredicateBuilder<
  U extends Element = Element
> extends NodePredicateBuilder<U> {
  public and<V extends U = U>(
    predicate: Predicate<U, V>
  ): ElementPredicateBuilder<V> {
    return new ElementPredicateBuilder<V>(
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
  ): BrowserSpecificPredicateBuilder<Node, U> {
    return new BrowserSpecificPredicateBuilder<Node, U>(node =>
      this.predicate(node)
    ).and(element =>
      BrowserSpecific.map(getRole(element, context, device), elementRole =>
        roles.some(role => role === elementRole)
      )
    );
  }
}

type BrowserSpecificPredicate<T, U extends T = T> = (
  t: T
) => boolean | BrowserSpecific<boolean>; // t is U

class BrowserSpecificPredicateBuilder<T, U extends T = T> {
  public readonly predicate: BrowserSpecificPredicate<T, U>;

  public constructor(predicate: BrowserSpecificPredicate<T, U> = () => true) {
    this.predicate = predicate;
  }

  public and<V extends U = U>(
    predicate: BrowserSpecificPredicate<U, V>
  ): BrowserSpecificPredicateBuilder<T, V> {
    return new BrowserSpecificPredicateBuilder((t: T) =>
      BrowserSpecific.map(this.predicate(t), b =>
        b ? predicate(t as U) : false
      )
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
  factory?: (builder: ElementPredicateBuilder) => ElementPredicateBuilder<T>
): Predicate<Node, T>;

export function isElement(
  factory: (
    builder: ElementPredicateBuilder
  ) => BrowserSpecificPredicateBuilder<Node>
): BrowserSpecificPredicate<Node>;

export function isElement(
  factory:
    | ((builder: ElementPredicateBuilder) => ElementPredicateBuilder)
    | ((
        builder: ElementPredicateBuilder
      ) => BrowserSpecificPredicateBuilder<Node>) = builder => builder
): Predicate<Node, Element> | BrowserSpecificPredicate<Node> {
  return node =>
    factory(new NodePredicateBuilder().isElement()).predicate(node);
}
