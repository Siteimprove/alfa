import { Iterable } from "@siteimprove/alfa-iterable";
import { Mapper } from "@siteimprove/alfa-mapper";
import { None, Option } from "@siteimprove/alfa-option";

import { Node } from "../node";
import { Sheet } from "../style/sheet";

const { map, join } = Iterable;

export class Document extends Node {
  public readonly style: Iterable<Sheet>;

  public static of(
    children: Mapper<Node, Iterable<Node>> = () => [],
    style: Iterable<Sheet> = []
  ): Document {
    return new Document(children, style);
  }

  private constructor(
    children: Mapper<Node, Iterable<Node>>,
    style: Iterable<Sheet>
  ) {
    super(children, None);

    this.style = style;
  }

  public toJSON(): Document.JSON {
    return {
      type: "document",
      children: [...this.children()].map(child => child.toJSON()),
      style: [...this.style].map(sheet => sheet.toJSON())
    };
  }

  public toString() {
    const children = join(
      map(this.children(), child => indent(child.toString())),
      "\n"
    );

    return `#document${children === "" ? "" : `\n${children}`}`;
  }
}

export namespace Document {
  export function isDocument(value: unknown): value is Document {
    return value instanceof Document;
  }

  export interface JSON {
    type: "document";
    children: Array<Node.JSON>;
    style: Array<Sheet.JSON>;
  }

  export function fromDocument(document: JSON): Document {
    return Document.of(self => {
      const parent = Option.of(self);
      return document.children.map(child => Node.fromNode(child, parent));
    }, document.style.map(style => Sheet.fromSheet(style)));
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
