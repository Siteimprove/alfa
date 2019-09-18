import { Element, isElement, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-util";

class NodePredicateBuilder<T extends Node = Node> {
  private readonly predicate: Predicate<Node, T>;

  public constructor(predicate: Predicate<Node, T>) {
    this.predicate = predicate;
  }

  public test(node: Node): node is T {
    return this.predicate(node);
  }

  public isElement(): ElementPredicateBuilder {
    return new ElementPredicateBuilder(node => {
      return this.test(node) && isElement(node);
    });
  }
}

class ElementPredicateBuilder extends NodePredicateBuilder<Element> {
  public withName(name: string): ElementPredicateBuilder {
    return new ElementPredicateBuilder(node => {
      return this.test(node) && node.localName === name;
    });
  }
}

const isNode = new NodePredicateBuilder(node => true);
//export const isElement = isNode.
