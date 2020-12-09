import { Array } from "@siteimprove/alfa-array";
import { Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Serializable } from "@siteimprove/alfa-json";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as json from "@siteimprove/alfa-json";

import { Anchored } from "./anchored";
import { Slot } from "./slot";
import { Scope } from "./scope";

import * as predicate from "./cell/predicate";

const { and, or } = Refinement;
const { isElement } = Element;
const { isText } = Text;

/**
 * @see https://html.spec.whatwg.org/#concept-cell
 */
export abstract class Cell
  implements Anchored, Equatable, Serializable<Cell.JSON> {
  protected readonly _element: Element;
  protected readonly _anchor: Slot;
  protected readonly _width: number;
  protected readonly _height: number;
  protected readonly _headers: Array<Slot>;

  protected constructor(
    element: Element,
    anchor: Slot,
    width: number,
    height: number,
    headers: Array<Slot>
  ) {
    this._element = element;
    this._anchor = anchor;
    this._width = width;
    this._height = height;
    this._headers = headers;
  }

  public get element(): Element {
    return this._element;
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

  public abstract isData(): this is Cell.Data;

  public abstract isHeader(): this is Cell.Header;

  public compare(anchored: Anchored): Comparison {
    return Anchored.compare(this, anchored);
  }

  public equals(cell: Cell): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Cell &&
      value._element.equals(this._element) &&
      value._anchor.equals(this._anchor) &&
      value._width === this._width &&
      value._height === this._height &&
      Array.equals(value._headers, this._headers)
    );
  }

  public abstract toJSON(): Cell.JSON;
}

export namespace Cell {
  export interface JSON {
    [key: string]: json.JSON;
    element: string;
    anchor: Slot.JSON;
    width: number;
    height: number;
    headers: Array<Slot.JSON>;
  }

  export function isCell(value: unknown): value is Cell {
    return value instanceof Cell;
  }

  export const { hasElement } = predicate;

  export class Data extends Cell {
    public static of(
      element: Element,
      anchor: Slot,
      width: number,
      height: number,
      headers: Iterable<Slot> = []
    ): Data {
      return new Data(
        element,
        anchor,
        width,
        height,
        Array.sort(Array.copy(Array.from(headers)))
      );
    }

    private constructor(
      element: Element,
      anchor: Slot,
      width: number,
      height: number,
      headers: Array<Slot>
    ) {
      super(element, anchor, width, height, headers);
    }

    public isData(): boolean {
      return true;
    }

    public isHeader(): boolean {
      return false;
    }

    public equals(cell: Data): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return value instanceof Data && super.equals(value);
    }

    public toJSON(): Data.JSON {
      return {
        type: "data",
        element: this._element.path(),
        anchor: this._anchor.toJSON(),
        width: this._width,
        height: this._height,
        headers: Array.toJSON(this._headers),
      };
    }
  }

  export namespace Data {
    export interface JSON extends Cell.JSON {
      type: "data";
    }

    export function isData(value: unknown): value is Data {
      return value instanceof Data;
    }
  }

  export const { of: data, isData } = Data;

  export class Header extends Cell {
    public static of(
      element: Element,
      anchor: Slot,
      width: number,
      height: number,
      headers: Iterable<Slot> = [],
      scope: Scope = "auto"
    ): Header {
      return new Header(
        element,
        anchor,
        width,
        height,
        Array.sort(Array.copy(Array.from(headers))),
        scope
      );
    }

    private readonly _scope: Scope;

    private constructor(
      element: Element,
      anchor: Slot,
      width: number,
      height: number,
      headers: Array<Slot>,
      scope: Scope
    ) {
      super(element, anchor, width, height, headers);

      this._scope = scope;
    }

    public get scope(): Scope {
      return this._scope;
    }

    public isData(): boolean {
      return false;
    }

    public isHeader(): boolean {
      return true;
    }

    public equals(cell: Header): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Header &&
        super.equals(value) &&
        value._scope === this._scope
      );
    }

    public toJSON(): Header.JSON {
      return {
        type: "header",
        scope: this._scope,
        element: this._element.path(),
        anchor: this._anchor.toJSON(),
        width: this._width,
        height: this._height,
        headers: Array.toJSON(this._headers),
      };
    }
  }

  export namespace Header {
    export interface JSON extends Cell.JSON {
      type: "header";
      scope: Scope;
    }

    export function isHeader(value: unknown): value is Header {
      return value instanceof Header;
    }
  }

  export const { of: header, isHeader } = Header;
}
