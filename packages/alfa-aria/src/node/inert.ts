import { None, Option } from "@siteimprove/alfa-option";

import * as dom from "@siteimprove/alfa-dom";

import { Role } from "../role";
import { Node } from "../node";

export class Inert extends Node {
  public static of(owner: dom.Node): Inert {
    return new Inert(owner);
  }

  private constructor(owner: dom.Node) {
    super(owner, () => [], None);
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

  public clone(): Inert {
    return new Inert(this._node);
  }

  public isIgnored(): boolean {
    return true;
  }

  public toJSON(): Inert.JSON {
    return {
      type: "inert",
      node: this._node.toJSON(),
      children: this._children.map(child => child.toJSON())
    };
  }

  public toString(): string {
    return "ignored";
  }
}

export namespace Inert {
  export interface JSON extends Node.JSON {
    type: "inert";
  }
}
