import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Node } from "../node";

export class Fragment extends Node {
  public static of(children: Mapper<Node, Iterable<Node>>): Fragment {
    return new Fragment(children);
  }

  private static _empty = new Fragment(() => []);

  public static empty(): Fragment {
    return this._empty;
  }

  private constructor(children: Mapper<Node, Iterable<Node>>) {
    super(children, None);
  }

  public path(): string {
    return "/";
  }

  public toJSON(): Fragment.JSON {
    return {
      type: "fragment",
      children: this._children.map((child) => child.toJSON()),
    };
  }

  public toString(): string {
    const children = this._children
      .map((child) => indent(child.toString()))
      .join("\n");

    return `#document-fragment${children === "" ? "" : `\n${children}`}`;
  }
}

export namespace Fragment {
  export interface JSON extends Node.JSON {
    type: "fragment";
    children: Array<Node.JSON>;
  }

  export function isFragment(value: unknown): value is Fragment {
    return value instanceof Fragment;
  }

  export function fromFragment(fragment: JSON): Fragment {
    return Fragment.of((self) => {
      const parent = Option.of(self);
      return fragment.children.map((child) => Node.fromNode(child, parent));
    });
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
