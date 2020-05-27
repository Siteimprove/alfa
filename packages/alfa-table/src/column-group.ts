import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";
import { Covering } from "./covering";

import { isHtmlElementWithName, parseSpan } from "./helpers";

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#concept-column-group
 */
export class ColumnGroup
  implements Comparable<ColumnGroup>, Covering, Equatable, Serializable {
  public static of(x: number, width: number, element: Element): ColumnGroup {
    return new ColumnGroup(x, width, element);
  }

  private readonly _x: number;
  private readonly _width: number;
  private readonly _element: Element;

  private constructor(x: number, width: number, element: Element) {
    this._x = x;
    this._width = width;
    this._element = element;
  }

  public get anchor(): { x: number } {
    return { x: this._x };
  }

  public get width(): number {
    return this._width;
  }

  public get element(): Element {
    return this._element;
  }

  public isCovering(x: number): boolean {
    // The column group is *not* covering the column (x) if either:
    // - the column is left of the column group; or
    // - the column is right of the column group.
    return !(x < this._x || this._x + this._width - 1 < x);
  }

  /**
   * Compare this column group to another according to their anchors.
   *
   * @remarks
   * In a given group of column groups (tables), no two column groups will have
   * the same anchor.
   */
  public compare(that: ColumnGroup): Comparison {
    if (this._x < that._x) {
      return Comparison.Less;
    }

    if (this._x > that._x) {
      return Comparison.Greater;
    }

    return Comparison.Equal;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof ColumnGroup &&
      this._x === value._x &&
      this._width === value._width &&
      this._element.equals(value._element)
    );
  }

  public toJSON(): ColumnGroup.JSON {
    return {
      anchor: this.anchor,
      width: this._width,
      element: this._element.toJSON(),
    };
  }
}

export namespace ColumnGroup {
  export interface JSON {
    [key: string]: json.JSON;
    anchor: {
      x: number;
    };
    width: number;
    element: Element.JSON;
  }

  export function from(element: Element): Result<ColumnGroup, string> {
    return ColumnGroup.Builder.from(element).map(
      (colgroup) => colgroup.columnGroup
    );
  }

  export class Builder implements Equatable, Serializable {
    private readonly _columnGroup: ColumnGroup;

    public static of(x: number, width: number, element: Element) {
      return new Builder(x, width, element);
    }

    private constructor(x: number, width: number, element: Element) {
      this._columnGroup = ColumnGroup.of(x, width, element);
    }

    public get columnGroup(): ColumnGroup {
      return this._columnGroup;
    }

    public get anchor(): { x: number } {
      return this._columnGroup.anchor;
    }

    public get width(): number {
      return this._columnGroup.width;
    }

    public get element(): Element {
      return this._columnGroup.element;
    }

    public anchorAt(x: number): Builder {
      return Builder.of(x, this.width, this.element);
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Builder && this._columnGroup.equals(value._columnGroup)
      );
    }

    public toJSON(): Builder.JSON {
      return {
        columnGroup: this._columnGroup.toJSON(),
      };
    }
  }

  export namespace Builder {
    export interface JSON {
      [key: string]: json.JSON;
      columnGroup: ColumnGroup.JSON;
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#forming-a-table
     * global step 9.1
     */
    export function from(
      colgroup: Element,
      x: number = -1
    ): Result<Builder, string> {
      if (colgroup.name !== "colgroup")
        return Err.of("This element is not a colgroup");

      let children = colgroup.children().filter(isHtmlElementWithName("col"));
      let totalSpan = 0;
      if (children.isEmpty()) {
        // second case
        // 1
        totalSpan = parseSpan(colgroup, "span", 1, 1000, 1);
      } else {
        // first case
        // 1
        for (const currentCol of children) {
          // loop control is 2 and 6
          // 3 (Columns)
          const span = parseSpan(currentCol, "span", 1, 1000, 1);
          totalSpan += span;
          // 5
          // Seems to have no actual effect and build stuff not used elsewhere ?!?
        }
      }
      // 1.4 and 1.7 done in table builder
      // 2.2 and 2.3 done in table builder
      return Ok.of(Builder.of(x, totalSpan, colgroup));
    }
  }
}
