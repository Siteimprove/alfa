import { None, Option } from "@siteimprove/alfa-option";

import * as dom from "@siteimprove/alfa-dom";

import { Node } from "../node";

export class Container extends Node {
  public static of(owner: dom.Node, children: Iterable<Node> = []): Container {
    return new Container(owner, Array.from(children));
  }

  private constructor(owner: dom.Node, children: Array<Node>) {
    super(owner, children);
  }

  public clone(parent: Option<Node> = None): Container {
    return new Container(
      this._node,
      this._children.map((child) => child.clone())
    );
  }

  public isIgnored(): boolean {
    return true;
  }

  public toJSON(): Container.JSON {
    return {
      type: "container",
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
