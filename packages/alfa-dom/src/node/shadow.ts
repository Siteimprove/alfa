import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Node } from "../node";
import { Sheet } from "../style/sheet";
import { Element } from "./element";

export class Shadow extends Node {
  public static of(
    mode: Shadow.Mode,
    host: Element,
    children: Mapper<Node, Iterable<Node>>,
    style: Iterable<Sheet> = []
  ): Shadow {
    return new Shadow(mode, host, children, style);
  }

  public static empty(host: Element): Shadow {
    return new Shadow(Shadow.Mode.Open, host, () => [], []);
  }

  private readonly _mode: Shadow.Mode;
  private readonly _host: Element;
  private readonly _style: Array<Sheet>;

  private constructor(
    mode: Shadow.Mode,
    host: Element,
    children: Mapper<Node, Iterable<Node>>,
    style: Iterable<Sheet>
  ) {
    super(children, None);

    this._mode = mode;
    this._host = host;
    this._style = Array.from(style);
  }

  public get mode(): Shadow.Mode {
    return this._mode;
  }

  public get host(): Element {
    return this._host;
  }

  public get style(): Iterable<Sheet> {
    return this._style;
  }

  public parent(options: Node.Traversal = {}): Option<Node> {
    if (options.composed === true) {
      return Option.of(this._host);
    }

    return None;
  }

  public path(options?: Node.Traversal): string {
    if (options?.composed || options?.flattened) {
      return this._host.path(options) + "/shadow()";
    }

    return "/";
  }

  public toJSON(): Shadow.JSON {
    return {
      type: "shadow",
      children: this._children.map((child) => child.toJSON()),
      mode: this._mode,
      style: this._style.map((sheet) => sheet.toJSON()),
    };
  }

  public toString(): string {
    const children = this._children
      .map((child) => indent(child.toString()))
      .join("\n");

    return `#shadow-root (${this._mode})${
      children === "" ? "" : `\n${children}`
    }`;
  }
}

export namespace Shadow {
  export enum Mode {
    Open = "open",
    Closed = "closed",
  }

  export interface JSON extends Node.JSON {
    type: "shadow";
    children: Array<Node.JSON>;
    mode: string;
    style: Array<Sheet.JSON>;
  }

  export function isShadow(value: unknown): value is Shadow {
    return value instanceof Shadow;
  }

  export function fromShadow(shadow: JSON, host: Element): Shadow {
    return Shadow.of(
      shadow.mode as Mode,
      host,
      (self) => {
        const parent = Option.of(self);
        return shadow.children.map((json) => Node.fromNode(json, parent));
      },
      shadow.style.map((sheet) => Sheet.fromSheet(sheet))
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
