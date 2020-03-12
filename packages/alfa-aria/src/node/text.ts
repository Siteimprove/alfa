import { None, Option } from "@siteimprove/alfa-option";

import * as dom from "@siteimprove/alfa-dom";

import { Role } from "../role";
import { Node } from "../node";

export class Text extends Node {
  public static of(
    owner: dom.Node,
    name: string,
    parent: Option<Node> = None
  ): Text {
    return new Text(owner, name, parent);
  }

  private readonly _name: string;

  private constructor(owner: dom.Node, name: string, parent: Option<Node>) {
    super(owner, () => [], parent);

    this._name = name;
  }

  public name(): Option<string> {
    return Option.of(this._name);
  }

  public role(): Option<Role> {
    return None;
  }

  public attribute(name: string): Option<string> {
    return None;
  }

  public clone(parent: Option<Node> = None): Text {
    return new Text(this._node, this._name, parent);
  }

  public isIgnored(): boolean {
    return false;
  }

  public toJSON(): Text.JSON {
    return {
      type: "text",
      node: this._node.toJSON(),
      name: this._name,
      children: this._children.map(child => child.toJSON())
    };
  }

  public toString(): string {
    return `text "${this._name}"`;
  }
}

export namespace Text {
  export interface JSON extends Node.JSON {
    type: "text";
    name: string;
  }
}
