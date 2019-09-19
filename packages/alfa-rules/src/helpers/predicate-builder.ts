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

class NodePredicateBuilder<T extends Node = Node> {
  public readonly predicate: Predicate<Node, T>;

  public constructor(predicate: Predicate<Node, T> = (x: Node) => true) {
    this.predicate = predicate;
  }

  public isElement(): ElementPredicateBuilder {
    return new ElementPredicateBuilder(node => {
      return this.predicate(node) && isElt(node);
    });
  }
}

class ElementPredicateBuilder extends NodePredicateBuilder<Element> {
  public withName(...names: Array<string>): ElementPredicateBuilder {
    return new ElementPredicateBuilder(node => {
      return this.predicate(node) && new Set(names).has(node.localName);
    });
  }

  public withInputType(
    ...inputTypes: Array<InputType>
  ): ElementPredicateBuilder {
    return new ElementPredicateBuilder(node => {
      return (
        this.predicate(node) &&
        new Set<Option<InputType>>(inputTypes).has(getInputType(node))
      );
    });
  }

  public withNamespace(
    context: Node,
    ...namespaces: Array<Namespace>
  ): ElementPredicateBuilder {
    return new ElementPredicateBuilder(node => {
      return (
        this.predicate(node) &&
        new Set<Option<Namespace>>(namespaces).has(
          getElementNamespace(node, context)
        )
      );
    });
  }
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
