import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import * as dom from "@siteimprove/alfa-dom";

import { Role } from "../role";
import { Node } from "../node";

export class Container extends Node {
  public static of(
    owner: dom.Node,
    children: Mapper<Node, Iterable<Node>> = () => [],
    parent: Option<Node> = None
  ): Container {
    return new Container(owner, children, parent);
  }

  private constructor(
    owner: dom.Node,
    children: Mapper<Node, Iterable<Node>>,
    parent: Option<Node>
  ) {
    super(owner, children, parent);
  }

  public name(): Option<string> {
    return None;
  }

  public role(): Option<Role> {
    return None;
  }

  public attribute(name: string): Option<string> {
    return None;
  }

  public clone(parent: Option<Node> = None): Container {
    return new Container(
      this._node,
      (self) => this._children.map((child) => child.clone(Option.of(self))),
      parent
    );
  }

  public isIgnored(): boolean {
    return true;
  }

  public toJSON(): Container.JSON {
    return {
      type: "container",
      node: this._node.toJSON(),
      children: this._children.map((child) => child.toJSON()),
    };
  }

  public toString(): string {
    return [
      "container",
      ...this._children.map((child) => indent(child.toString())),
    ].join("\n");
  }
}

export namespace Container {
  export interface JSON extends Node.JSON {
    type: "container";
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
