import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Node } from "../node";
import { Sheet } from "../style/sheet";
import { Element } from "./element";

export class Document extends Node {
  public static of(
    children: Mapper<Node, Iterable<Node>>,
    style: Iterable<Sheet> = [],
    frame: Option<Element> = None
  ): Document {
    return new Document(children, style, frame);
  }

  private static _empty: Document = new Document(() => [], [], None);

  public static empty(frame: Option<Element> = None): Document {
    return frame.isNone() ? this._empty : new Document(() => [], [], frame);
  }

  private readonly _style: Array<Sheet>;
  private readonly _frame: Option<Element>;

  private constructor(
    children: Mapper<Node, Iterable<Node>>,
    style: Iterable<Sheet>,
    frame: Option<Element>
  ) {
    super(children, None);

    this._style = Array.from(style);
    this._frame = frame;
  }

  public get style(): Iterable<Sheet> {
    return this._style;
  }

  public get frame(): Option<Element> {
    return this._frame;
  }

  public path(): string {
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

  export function fromDocument(
    document: JSON,
    frame: Option<Element> = None
  ): Document {
    return Document.of(
      (self) => {
        const parent = Option.of(self);
        return document.children.map((child) => Node.fromNode(child, parent));
      },
      document.style.map((style) => Sheet.fromSheet(style)),
      frame
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
