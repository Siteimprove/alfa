import { Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Serializable } from "@siteimprove/alfa-json";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as json from "@siteimprove/alfa-json";

import { Anchored } from "./anchored";
import { Slot } from "./slot";

const { and, or } = Refinement;
const { isElement } = Element;
const { isText } = Text;

/**
 * @see https://html.spec.whatwg.org/#concept-cell
 */
export class Cell implements Anchored, Equatable, Serializable {
  public static of(
    element: Element,
    type: Cell.Type,
    anchor: Slot,
    width: number,
    height: number,
    headers: Iterable<Slot> = []
  ): Cell {
    return new Cell(element, type, anchor, width, height, Array.from(headers));
  }

  private readonly _element: Element;
  private readonly _type: Cell.Type;
  private readonly _anchor: Slot;
  private readonly _width: number;
  private readonly _height: number;
  private readonly _headers: Array<Slot>;

  private constructor(
    element: Element,
    type: Cell.Type,
    anchor: Slot,
    width: number,
    height: number,
    headers: Array<Slot>
  ) {
    this._element = element;
    this._type = type;
    this._anchor = anchor;
    this._width = width;
    this._height = height;
    this._headers = headers;
  }

  public get element(): Element {
    return this._element;
  }

  public get type(): Cell.Type {
    return this._type;
  }

  public get anchor(): Slot {
    return this._anchor;
  }

  public get x(): number {
    return this._anchor.x;
  }

  public get y(): number {
    return this._anchor.y;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get headers(): Sequence<Slot> {
    return Sequence.from(this._headers);
  }

  /**
   * Check if this cell is empty.
   *
   * @see https://html.spec.whatwg.org/#empty-cell
   */
  public isEmpty(): boolean {
    return this._element.children().none(
      or(
        isElement,
        and(isText, (text) => text.data.trim().length > 0)
      )
    );
  }

  /**
   * Check if this cell is a data cell.
   */
  public isData(): boolean {
    return this._type === Cell.Type.Data;
  }

  /**
   * Check if this cell is a header cell.
   */
  public isHeader(): boolean {
    return this._type === Cell.Type.Header;
  }

  public compare(anchored: Anchored): Comparison {
    return Anchored.compare(this, anchored);
  }

  public equals(cell: Cell): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Cell &&
      value._element.equals(this._element) &&
      value._type === this._type &&
      value._anchor.equals(this._anchor) &&
      value._width === this._width &&
      value._height === this._height &&
      value._headers.length === this._headers.length &&
      value._headers.every((header, i) => header.equals(this._headers[i]))
    );
  }

  public toJSON(): Cell.JSON {
    return {
      element: this._element.path(),
      type: this._type,
      anchor: this._anchor.toJSON(),
      width: this._width,
      height: this._height,
      headers: this._headers.map((header) => header.toJSON()),
    };
  }
}

export namespace Cell {
  export enum Type {
    Data = "data",
    Header = "header",
  }

  export interface JSON {
    [key: string]: json.JSON;
    element: string;
    type: string;
    anchor: Slot.JSON;
    width: number;
    height: number;
    headers: Array<Slot.JSON>;
  }

  export function isCell(value: unknown): value is Cell {
    return value instanceof Cell;
  }
}
