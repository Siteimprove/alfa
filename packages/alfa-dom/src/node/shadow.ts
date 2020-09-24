import { None, Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import { Node } from "../node";
import { Sheet } from "../style/sheet";
import { Element } from "./element";

export class Shadow extends Node {
  public static of(
    children: Iterable<Node>,
    style: Iterable<Sheet> = [],
    mode: Shadow.Mode = Shadow.Mode.Open
  ): Shadow {
    return new Shadow(Array.from(children), Array.from(style), mode);
  }

  public static empty(): Shadow {
    return new Shadow([], [], Shadow.Mode.Open);
  }

  private readonly _mode: Shadow.Mode;
  private _host: Option<Element> = None;
  private readonly _style: Array<Sheet>;

  private constructor(
    children: Array<Node>,
    style: Array<Sheet>,
    mode: Shadow.Mode
  ) {
    super(children);

    this._mode = mode;
    this._style = style;
  }

  public get mode(): Shadow.Mode {
    return this._mode;
  }

  public get host(): Option<Element> {
    return this._host;
  }

  public get style(): Iterable<Sheet> {
    return this._style;
  }

  public parent(options: Node.Traversal = {}): Option<Node> {
    if (options.composed === true) {
      return this._host;
    }

    return None;
  }

  public path(options?: Node.Traversal): string {
    if (options?.composed) {
      return (
        this._host.map((host) => host.path(options)).getOr("") +
        "/shadow-root()"
      );
    }

    if (options?.flattened) {
      return this._host.map((host) => host.path(options)).getOr("/");
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

  /**
   * @internal
   */
  public _attachParent(): boolean {
    return false;
  }

  /**
   * @internal
   */
  public _attachHost(host: Element): boolean {
    if (this._frozen || this._host.isSome()) {
      return false;
    }

    this._host = Option.of(host);
    this._frozen = true;

    return true;
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

  /**
   * @internal
   */
  export function fromShadow(json: JSON): Trampoline<Shadow> {
    return Trampoline.traverse(json.children, Node.fromNode).map((children) =>
      Shadow.of(children, json.style.map(Sheet.from), json.mode as Mode)
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
