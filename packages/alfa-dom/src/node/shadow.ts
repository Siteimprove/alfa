import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Node } from "../node";
import { Sheet } from "../style/sheet";
import { Element } from "./element";

const { map, join } = Iterable;

export class Shadow extends Node {
  public static of(
    mode: Shadow.Mode,
    host: Element,
    children: Mapper<Node, Iterable<Node>>,
    style: Iterable<Sheet> = []
  ): Shadow {
    return new Shadow(mode, host, children, style);
  }

  public readonly mode: Shadow.Mode;
  public readonly host: Element;
  public readonly style: Iterable<Sheet>;

  private constructor(
    mode: Shadow.Mode,
    host: Element,
    children: Mapper<Node, Iterable<Node>>,
    style: Iterable<Sheet>
  ) {
    super(children, None);

    this.mode = mode;
    this.host = host;
    this.style = style;
  }

  public parent(options: Node.Traversal = {}): Option<Node> {
    if (options.composed === true) {
      return Option.of(this.host);
    }

    return None;
  }

  public toJSON(): Shadow.JSON {
    return {
      type: "shadow",
      children: [...this.children()].map(child => child.toJSON()),
      mode: this.mode,
      style: [...this.style].map(sheet => sheet.toJSON())
    };
  }

  public toString(): string {
    const children = join(
      map(this.children(), child => indent(child.toString())),
      "\n"
    );

    return `#shadow-root (${this.mode})${
      children === "" ? "" : `\n${children}`
    }`;
  }
}

export namespace Shadow {
  export const enum Mode {
    Open = "open",
    Closed = "closed"
  }

  export function isShadowRoot(value: unknown): value is Shadow {
    return value instanceof Shadow;
  }

  export interface JSON {
    type: "shadow";
    children: Array<Node.JSON>;
    mode: string;
    style: Array<Sheet.JSON>;
  }

  export function fromShadow(shadow: JSON, host: Element): Shadow {
    return Shadow.of(
      shadow.mode as Mode,
      host,
      self => {
        const parent = Option.of(self);
        return shadow.children.map(json => Node.fromNode(json, parent));
      },
      shadow.style.map(sheet => Sheet.fromSheet(sheet))
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
