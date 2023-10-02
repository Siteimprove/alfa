import { Device } from "@siteimprove/alfa-device";
import { None, Option } from "@siteimprove/alfa-option";
import { Trampoline } from "@siteimprove/alfa-trampoline";
import { Node } from "../node";
import { Sheet } from "../style/sheet";
import { Element } from "./element";

/**
 * @public
 */
export class Document extends Node<"document"> {
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
    super(children, "document");

    this._style = Array.from(style);
  }

  public get style(): Iterable<Sheet> {
    return this._style;
  }

  public get frame(): Option<Element> {
    return this._frame;
  }

  public parent(options: Node.Traversal = Node.Traversal.empty): Option<Node> {
    return options.isSet(Node.Traversal.nested)
      ? this.frame
      : super.parent(options);
  }

  /**
   * @internal
   **/
  protected _internalPath(
    options: Node.Traversal = Node.Traversal.empty
  ): string {
    if (options.isSet(Node.Traversal.nested)) {
      return this._frame
        .map((frame) => frame.path(options) + "/document-node()")
        .getOr("/");
    }

    return "/";
  }

  public toJSON(): Document.JSON {
    return {
      ...super.toJSON(),
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

/**
 * @public
 */
export namespace Document {
  export interface JSON extends Node.JSON<"document"> {
    style: Array<Sheet.JSON>;
  }

  export function isDocument(value: unknown): value is Document {
    return value instanceof Document;
  }

  /**
   * @internal
   */
  export function fromDocument(
    json: JSON,
    device: Option<Device>
  ): Trampoline<Document> {
    return Trampoline.traverse(json.children ?? [], (child) =>
      Node.fromNode(child, device)
    ).map((children) => Document.of(children, json.style.map(Sheet.from)));
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
