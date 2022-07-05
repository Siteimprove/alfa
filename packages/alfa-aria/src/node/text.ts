import { Option } from "@siteimprove/alfa-option";
import { Node as treeNode } from "@siteimprove/alfa-tree";

import * as dom from "@siteimprove/alfa-dom";

import { Name } from "../name";
import { Node } from "../node";

/**
 * @public
 */
export class Text extends Node<"text"> {
  public static of(
    owner: dom.Node,
    name: Option<Name>,
    nodeId?: treeNode.Id.User
  ): Text {
    return new Text(
      owner,
      name,
      nodeId ?? Node.Id.create(owner.nodeId.namespace)
    );
  }

  private readonly _name: Option<Name>;

  private constructor(
    owner: dom.Node,
    name: Option<Name>,
    nodeId: Node.Id | treeNode.Id.User
  ) {
    super(owner, [], "text", nodeId);

    this._name = name;
  }

  public get name(): Option<Name> {
    return this._name;
  }

  // public clone(): Text {
  //   return new Text(this._node, this._name);
  // }

  public isIgnored(): boolean {
    return false;
  }

  public toJSON(): Text.JSON {
    const result = {
      ...super.toJSON(),
      name: this._name.map((name) => name.value).getOr(null),
    };
    delete result.children;

    return result;
  }

  public toString(): string {
    return `text "${this._name.map((name) => `${name}`).getOr("")}"`;
  }
}

/**
 * @public
 */
export namespace Text {
  export interface JSON extends Node.JSON<"text"> {
    name: string | null;
  }
}
