import { None, Option } from "@siteimprove/alfa-option";

import { Node } from "../node";
import { Sheet } from "../style/sheet";
import { Element } from "./element";
import { Trampoline } from "@siteimprove/alfa-trampoline";
import { Iterable } from "@siteimprove/alfa-iterable";

export class Document extends Node {
  public static of(
    children: Iterable<Node>,
    style: Iterable<Sheet> = []
  ): Document {
    return new Document(Array.from(children), style);
  }

  public static empty(): Document {
    return new Document([], []);
  }

  private readonly _style: Array<Sheet>;
  private _frame: Option<Element> = None;

  private constructor(children: Array<Node>, style: Iterable<Sheet>) {
    super(children);

    this._style = Array.from(style);
  }

  public get style(): Iterable<Sheet> {
    return this._style;
  }

  public get frame(): Option<Element> {
    return this._frame;
  }

  public parent(options: Node.Traversal = {}): Option<Node> {
    return options.nested === true ? this.frame : super.parent(options);
  }

  public path(options?: Node.Traversal): string {
    if (options?.nested) {
      return this._frame
        .map((frame) => frame.path(options) + "/document-node()")
        .getOr("/");
    }

    return "/";
  }

  public toJSON(): Document.JSON {
    return {
      type: "document",
      children: this._children.map((child) => child.toJSON()),
      style: this._style.map((sheet) => sheet.toJSON()),
    };
  }

  public toString(): string {
    const children = this._children
      .map((child) => indent(child.toString()))
      .join("\n");

    return `#document${children === "" ? "" : `\n${children}`}`;
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
  public _attachFrame(frame: Element): boolean {
    if (this._frozen || this._frame.isSome()) {
      return false;
    }

    this._frame = Option.of(frame);
    this._frozen = true;

    return true;
  }
}

export namespace Document {
  export interface JSON extends Node.JSON {
    type: "document";
    children: Array<Node.JSON>;
    style: Array<Sheet.JSON>;
  }

  export function isDocument(value: unknown): value is Document {
    return value instanceof Document;
  }

  /**
   * @internal
   */
  export function fromDocument(json: JSON): Trampoline<Document> {
    return Trampoline.traverse(json.children, Node.fromNode).map((children) =>
      Document.of(children, json.style.map(Sheet.from))
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
