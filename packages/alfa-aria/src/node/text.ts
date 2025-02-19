import type { Option } from "@siteimprove/alfa-option";

import type * as dom from "@siteimprove/alfa-dom";

import type { Name } from "../name/index.js";
import { Node } from "../node.js";

/**
 * @public
 */
export class Text extends Node<"text"> {
  public static of(owner: dom.Node, name: Option<Name>): Text {
    return new Text(owner, name);
  }

  private readonly _name: Option<Name>;

  protected constructor(owner: dom.Node, name: Option<Name>) {
    super(owner, [], "text");

    this._name = name;
  }

  public get name(): Option<Name> {
    return this._name;
  }

  public clone(): Text {
    return new Text(this._node, this._name);
  }

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
