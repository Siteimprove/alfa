import { None, Option } from "@siteimprove/alfa-option";

import * as dom from "@siteimprove/alfa-dom";

import { Node } from "../node";

/**
 * @public
 */
export class Container extends Node<"container"> {
  public static of(owner: dom.Node, children: Iterable<Node> = []): Container {
    return new Container(owner, Array.from(children));
  }

  private constructor(owner: dom.Node, children: Array<Node>) {
    super(owner, children, "container");
  }

  public clone(parent: Option<Node> = None): Container {
    return new Container(
      this._node,
      (this._children as Array<Node>).map((child) => child.clone())
    );
  }

  public isIgnored(): boolean {
    return true;
  }

  public toString(): string {
    return [
      "container",
      ...this._children.map((child) => indent(child.toString())),
    ].join("\n");
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
