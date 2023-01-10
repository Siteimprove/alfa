import { None, Option } from "@siteimprove/alfa-option";

import * as dom from "@siteimprove/alfa-dom";

import { Node } from "../node";
import { Role } from "../role";

/**
 * @remarks
 * Containers are structural element with no interesting semantic.
 * They correspond to elements with no "interesting" property, for this a role
 * of `generic` is considered as not interesting.
 * Because `generic` can also be containers, they may still have a role.
 * Because `generic` have prohibited names, and having an `aria-*` property
 * is "interesting", Container don't need a name or attributes.
 *
 * @public
 */
export class Container extends Node<"container"> {
  public static of(
    owner: dom.Node,
    children: Iterable<Node> = [],
    role: Option<Role> = None
  ): Container {
    return new Container(owner, Array.from(children), role);
  }

  private readonly _role: Option<Role>;

  private constructor(
    owner: dom.Node,
    children: Array<Node>,
    role: Option<Role>
  ) {
    super(owner, children, "container");
    this._role = role;
  }

  public clone(parent: Option<Node> = None): Container {
    return new Container(
      this._node,
      (this._children as Array<Node>).map((child) => child.clone()),
      this._role
    );
  }

  get role(): Option<Role> {
    return this._role;
  }

  public isIgnored(): boolean {
    return true;
  }

  public toJSON(): Container.JSON {
    return {
      ...super.toJSON(),
      role: this._role.map((role) => role.name).getOr(null),
    };
  }

  public toString(): string {
    return [
      "container",
      ...this._children.map((child) => indent(child.toString())),
    ].join("\n");
  }
}

/**
 * @public
 */
export namespace Container {
  export interface JSON extends Node.JSON<"container"> {
    role: Role.Name | null;
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
