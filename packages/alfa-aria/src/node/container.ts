import { None, Option } from "@siteimprove/alfa-option";
import { Node as treeNode } from "@siteimprove/alfa-tree";

import * as dom from "@siteimprove/alfa-dom";

import { Node } from "../node";

/**
 * @public
 */
export class Container extends Node<"container"> {
  public static of(
    owner: dom.Node,
    children: Iterable<Node> = [],
    nodeID?: treeNode.Id.User
  ): Container {
    return new Container(
      owner,
      Array.from(children),
      nodeID ?? Node.Id.create(owner.nodeId.namespace)
    );
  }

  private constructor(
    owner: dom.Node,
    children: Array<Node>,
    nodeId: Node.Id | treeNode.Id.User
  ) {
    super(owner, children, "container", nodeId);
  }

  // public clone(parent: Option<Node> = None): Container {
  //   return new Container(
  //     this._node,
  //     (this._children as Array<Node>).map((child) => child.clone())
  //   );
  // }

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
