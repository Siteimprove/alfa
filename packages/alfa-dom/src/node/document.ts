import { Cache } from "@siteimprove/alfa-cache";
import { Map } from "@siteimprove/alfa-map";
import { None, Option } from "@siteimprove/alfa-option";
import { Sequence } from "@siteimprove/alfa-sequence/src/sequence";
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

  private _elementDescendants: Array<Sequence<Element>> = [];
  /**
   * {@link https://dom.spec.whatwg.org/#concept-tree-descendant}
   */
  // We very often need all elements in a document, typically at the start of
  // a rule Applicability. Caching the filtering saves a lot of time.
  public elementDescendants(
    options: Node.Traversal = Node.Traversal.empty
  ): Sequence<Element> {
    if (this._elementDescendants[options.value] === undefined) {
      this._elementDescendants[options.value] = this.descendants(
        options
      ).filter(Element.isElement);
    }

    return this._elementDescendants[options.value];
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
  export namespace Query {
    const elementCache = Cache.empty<Document, Map<string, Element>>();

    export function getElementById(
      document: Document,
      id: string
    ): Option<Element> {
      return elementCache
        .get(document, () => {
          const elements = document.elementDescendants();
          return Map.from(
            elements
              .collect((element) =>
                element.id.map((id) => [id, element] as const)
              )
              .reverse()
          );
        })
        .get(id);
    }
  }

  export interface JSON extends Node.JSON<"document"> {
    style: Array<Sheet.JSON>;
  }

  export function isDocument(value: unknown): value is Document {
    return value instanceof Document;
  }

  /**
   * @internal
   */
  export function fromDocument(json: JSON): Trampoline<Document> {
    return Trampoline.traverse(json.children ?? [], Node.fromNode).map(
      (children) => Document.of(children, json.style.map(Sheet.from))
    );
  }
}

function indent(input: string): string {
  return input.replace(/^/gm, "  ");
}
