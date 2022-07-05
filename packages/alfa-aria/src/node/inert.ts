import * as dom from "@siteimprove/alfa-dom";
import { Node as treeNode } from "@siteimprove/alfa-tree";

import { Node } from "../node";

/**
 * @public
 */
export class Inert extends Node<"inert"> {
  public static of(owner: dom.Node, nodeId?: treeNode.Id.User): Inert {
    return new Inert(owner, nodeId ?? Node.Id.create(owner.nodeId.namespace));
  }

  private constructor(owner: dom.Node, nodeId: Node.Id | treeNode.Id.User) {
    super(owner, [], "inert", nodeId);
  }

  public isIgnored(): boolean {
    return true;
  }

  public toString(): string {
    return "ignored";
  }

  public toJSON(): Node.JSON<"inert"> {
    const result = super.toJSON();
    delete result.children;

    return result;
  }
}
