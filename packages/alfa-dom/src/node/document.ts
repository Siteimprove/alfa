import { Array } from "@siteimprove/alfa-array";
import type { Device } from "@siteimprove/alfa-device";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { String } from "@siteimprove/alfa-string";
import { Trampoline } from "@siteimprove/alfa-trampoline";

import * as json from "@siteimprove/alfa-json";

import { BaseNode } from "./node.ts";
import { Sheet } from "../style/sheet.ts";
import type { Element } from "./slotable/index.ts";

import type { Node } from "./index.ts";

/**
 * @public
 */
export class Document extends BaseNode<"document"> {
  public static of(
    children: Iterable<Node>,
    style: Iterable<Sheet> = [],
    externalId?: string,
    internalId?: string,
    extraData?: any,
  ): Document {
    return new Document(
      Array.from(children),
      style,
      externalId,
      internalId,
      extraData,
    );
  }

  public static empty(): Document {
    return new Document([], []);
  }

  private readonly _style: Array<Sheet>;
  private _frame: Option<Element> = None;

  protected constructor(
    children: Array<Node>,
    style: Iterable<Sheet>,
    externalId?: string,
    internalId?: string,
    extraData?: any,
  ) {
    super(children, "document", externalId, internalId, extraData);

    this._style = Array.from(style);
  }

  public get style(): Iterable<Sheet> {
    return this._style;
  }

  public get frame(): Option<Element> {
    return this._frame;
  }

  public parent(
    options: BaseNode.Traversal = BaseNode.Traversal.empty,
  ): Option<Node> {
    return options.isSet(BaseNode.Traversal.nested)
      ? this.frame
      : super.parent(options);
  }

  /**
   * @internal
   **/
  protected _internalPath(
    options: BaseNode.Traversal = BaseNode.Traversal.empty,
  ): string {
    if (options.isSet(BaseNode.Traversal.nested)) {
      return this._frame
        .map((frame) => frame.path(options) + "/document-node()")
        .getOr("/");
    }

    return "/";
  }

  public toJSON(
    options: BaseNode.SerializationOptions & {
      verbosity:
        | json.Serializable.Verbosity.Minimal
        | json.Serializable.Verbosity.Low;
    },
  ): Document.MinimalJSON;
  public toJSON(options?: BaseNode.SerializationOptions): Document.JSON;
  public toJSON(
    options?: BaseNode.SerializationOptions,
  ): Document.MinimalJSON | Document.JSON {
    const result = {
      ...super.toJSON(options),
    };

    const verbosity = options?.verbosity ?? json.Serializable.Verbosity.Medium;

    if (verbosity < json.Serializable.Verbosity.Medium) {
      return result;
    }

    result.style = this._style.map((sheet) => sheet.toJSON());

    return result;
  }

  public toString(): string {
    const children = this._children
      .map((child) => String.indent(child.toString()))
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
  export interface MinimalJSON extends BaseNode.JSON<"document"> {}

  export interface JSON extends BaseNode.JSON<"document"> {
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
    fromNode: (json: Node.JSON, device?: Device) => Trampoline<Node>,
    device?: Device,
  ): Trampoline<Document> {
    return Trampoline.traverse(json.children ?? [], (child) =>
      fromNode(child, device),
    ).map((children) =>
      Document.of(
        children,
        json.style.map(Sheet.from),
        json.externalId,
        json.internalId,
      ),
    );
  }
}
