import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Node } from "../node";
import { Sheet } from "../style/sheet";

export class Document extends Node {
  public static of(
    children: Mapper<Node, Iterable<Node>>,
    style: Iterable<Sheet> = []
  ): Document {
    return new Document(children, style);
  }

  public static empty(): Document {
    return new Document(() => [], []);
  }

  private readonly _style: Array<Sheet>;

  private constructor(
    children: Mapper<Node, Iterable<Node>>,
    style: Iterable<Sheet>
  ) {
    super(children, None);

    this._style = Array.from(style);
  }

  public get style(): Iterable<Sheet> {
    return this._style;
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

  export function fromDocument(document: JSON): Document {
    return Document.of(
      (self) => {
        const parent = Option.of(self);
        return document.children.map((child) => Node.fromNode(child, parent));
      },
      document.style.map((style) => Sheet.fromSheet(style))
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
