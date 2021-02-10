import { Comparison } from "@siteimprove/alfa-comparable";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import { Anchored } from "./anchored";
import { Slot } from "./slot";

/**
 * @see https://html.spec.whatwg.org/#concept-row
 */
export class Row implements Anchored, Equatable, Serializable<Row.JSON> {
  public static of(y: number): Row {
    return new Row(y);
  }

  private readonly _y: number;

  private constructor(y: number) {
    this._y = y;
  }

  public get y(): number {
    return this._y;
  }

  public get anchor(): Slot {
    return Slot.of(0, this._y);
  }

  public compare(anchored: Anchored): Comparison {
    return Anchored.compare(this, anchored);
  }

  public equals(row: Row): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Row && value._y === this._y;
  }

  public toJSON(): Row.JSON {
    return {
      y: this._y,
    };
  }
}

export namespace Row {
  export interface JSON {
    [key: string]: json.JSON;
    y: number;
  }

  export function isRow(value: unknown): value is Row {
    return value instanceof Row;
  }

  /**
   * @see https://html.spec.whatwg.org/#concept-row-group
   */
  export class Group implements Anchored, Equatable, Serializable<Group.JSON> {
    public static of(element: Element, y: number, height: number): Group {
      return new Group(element, y, height);
    }

    private readonly _element: Element;
    private readonly _y: number;
    private readonly _height: number;

    private constructor(element: Element, y: number, height: number) {
      this._element = element;
      this._y = y;
      this._height = height;
    }

    public get element(): Element {
      return this._element;
    }

    public get y(): number {
      return this._y;
    }

    public get anchor(): Slot {
      return Slot.of(0, this._y);
    }

    public get height(): number {
      return this._height;
    }

    public compare(anchored: Anchored): Comparison {
      return Anchored.compare(this, anchored);
    }

    public equals(group: this): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Group &&
        value._element.equals(this._element) &&
        value._y === this._y &&
        value._height === this._height
      );
    }

    public toJSON(): Group.JSON {
      return {
        element: this._element.path(),
        y: this._y,
        height: this._height,
      };
    }
  }

  export namespace Group {
    export interface JSON {
      [key: string]: json.JSON;
      element: string;
      y: number;
      height: number;
    }

    export function isGroup(value: unknown): value is Group {
      return value instanceof Group;
    }
  }

  export const { of: group, isGroup } = Group;
}
