import { Comparison } from "@siteimprove/alfa-comparable";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import { Anchored } from "./anchored";
import { Slot } from "./slot";

/**
 * @see https://html.spec.whatwg.org/#concept-column
 */
export class Column implements Anchored, Equatable, Serializable<Column.JSON> {
  public static of(x: number): Column {
    return new Column(x);
  }

  private readonly _x: number;

  private constructor(x: number) {
    this._x = x;
  }

  public get x(): number {
    return this._x;
  }

  public get anchor(): Slot {
    return Slot.of(this._x, 0);
  }

  public compare(anchored: Anchored): Comparison {
    return Anchored.compare(this, anchored);
  }

  public equals(column: Column): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Column && value._x === this._x;
  }

  public toJSON(): Column.JSON {
    return {
      x: this._x,
    };
  }
}

export namespace Column {
  export interface JSON {
    [key: string]: json.JSON;
    x: number;
  }

  export function isColumn(value: unknown): value is Column {
    return value instanceof Column;
  }

  /**
   * @see https://html.spec.whatwg.org/#concept-column-group
   */
  export class Group implements Anchored, Equatable, Serializable<Group.JSON> {
    public static of(element: Element, x: number, width: number): Group {
      return new Group(element, x, width);
    }

    private readonly _element: Element;
    private readonly _x: number;
    private readonly _width: number;

    private constructor(element: Element, x: number, width: number) {
      this._element = element;
      this._x = x;
      this._width = width;
    }

    public get element(): Element {
      return this._element;
    }

    public get x(): number {
      return this._x;
    }

    public get anchor(): Slot {
      return Slot.of(this._x, 0);
    }

    public get width(): number {
      return this._width;
    }

    public compare(anchored: Anchored): Comparison {
      return Anchored.compare(this, anchored);
    }

    public equals(group: Group): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Group &&
        value._element.equals(this._element) &&
        value._x === this._x &&
        value._width === this._width
      );
    }

    public toJSON(): Group.JSON {
      return {
        element: this._element.path(),
        x: this._x,
        width: this._width,
      };
    }
  }

  export namespace Group {
    export interface JSON {
      [key: string]: json.JSON;
      element: string;
      x: number;
      width: number;
    }

    export function isGroup(value: unknown): value is Group {
      return value instanceof Group;
    }
  }

  export const { of: group, isGroup } = Group;
}
