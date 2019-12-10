import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Node } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";
import { Sequence } from "@siteimprove/alfa-sequence";

import { Role } from "./role";

/**
 * @see https://w3c.github.io/aria/#accessibility_tree
 */
export class AccessibleNode {
  public readonly node: Node;
  public readonly role: Option<Role>;
  public readonly name: string;
  private readonly _attributes: Map<string, string>;
  private readonly _children: Array<AccessibleNode>;
  private readonly _parent: Option<AccessibleNode>;

  private constructor(
    node: Node,
    role: Option<Role>,
    name: string,
    attributes: Map<string, string>,
    children: Mapper<AccessibleNode, Iterable<AccessibleNode>>,
    parent: Option<AccessibleNode>
  ) {
    this.node = node;
    this.role = role;
    this.name = name;
    this._attributes = attributes;
    this._children = Array.from(children(this));
    this._parent = parent;
  }

  public attribute(name: string): Option<string> {
    return this._attributes.get(name);
  }

  public children(): Sequence<AccessibleNode> {
    return Sequence.from(this._children);
  }

  public parent(): Option<AccessibleNode> {
    return this._parent;
  }
}

export namespace AccessibleNode {
  export function from(
    node: Node,
    device: Device
  ): Branched<Option<AccessibleNode>, Browser> {
    return Branched.of(None);
  }
}
