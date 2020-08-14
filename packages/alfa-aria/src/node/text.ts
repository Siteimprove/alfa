import { Option } from "@siteimprove/alfa-option";

import * as dom from "@siteimprove/alfa-dom";

import { Name } from "../name";
import { Node } from "../node";

export class Text extends Node {
  public static of(owner: dom.Node, name: Name): Text {
    return new Text(owner, name);
  }

  private readonly _name: Name;

  private constructor(owner: dom.Node, name: Name) {
    super(owner, []);

    this._name = name;
  }

  public get name(): Option<Name> {
    return Option.of(this._name);
  }

  public clone(): Text {
    return new Text(this._node, this._name);
  }

  public isIgnored(): boolean {
    return false;
  }

  public toJSON(): Text.JSON {
    return {
      type: "text",
      name: this._name.value,
      children: this._children.map((child) => child.toJSON()),
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
