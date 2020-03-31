import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Element } from "..";
import { isElementByName, parseSpan } from "./helpers";

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#concept-column-group
 */
export class ColGroup implements Comparable<ColGroup>, Equatable, Serializable {
  private readonly _x: number;
  private readonly _width: number;
  private readonly _element: Element;

  public static of(x: number, width: number, element: Element): ColGroup {
    return new ColGroup(x, width, element);
  }

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

  public static from(element: Element): Result<ColGroup, string> {
    return ColGroup.Builder.from(element).map((colgroup) => colgroup.colgroup);
  }

  public isCovering(x: number): boolean {
    return !(
      // colgroup is *not* covering if either
      (x < this._x || this._x + this._width - 1 < x) // slot is left of colgroup or slot is right of colgroup
    );
  }

  /**
   * compare colgroups according to their anchor
   * in a given group of colgroups (table), no two different colgroups can have the same anchor, so this is good.
   */
  public compare(colgroup: ColGroup): Comparison {
    if (this._x < colgroup._x) return Comparison.Less;
    if (this._x > colgroup._x) return Comparison.More;
    return Comparison.Equal;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof ColGroup &&
      this._width === value._width &&
      this._x === value._x &&
      this._element.equals(value._element)
    );
  }

  public toJSON(): ColGroup.JSON {
    return {
      anchor: this.anchor,
      width: this._width,
      element: this._element.toJSON(),
    };
  }
}

export namespace ColGroup {
  export interface JSON {
    [key: string]: json.JSON;

    anchor: { x: number };
    width: number;
    element: Element.JSON;
  }

  export class Builder implements Equatable, Serializable {
    private readonly _colgroup: ColGroup;

    public static of(x: number, width: number, element: Element) {
      return new Builder(x, width, element);
    }

    private constructor(x: number, width: number, element: Element) {
      this._colgroup = ColGroup.of(x, width, element);
    }

    public get colgroup(): ColGroup {
      return this._colgroup;
    }

    public get anchor(): { x: number } {
      return this._colgroup.anchor;
    }

    public get width(): number {
      return this._colgroup.width;
    }

    public get element(): Element {
      return this._colgroup.element;
    }

    public anchorAt(x: number): Builder {
      return Builder.of(x, this.width, this.element);
    }

    public equals(value: unknown): value is this {
      return value instanceof Builder && this._colgroup.equals(value._colgroup);
    }

    public toJSON(): Builder.JSON {
      return {
        colgroup: this._colgroup.toJSON(),
      };
    }
  }

  export namespace Builder {
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

      let children = colgroup.children().filter(isElementByName("col"));
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
          // The col element represents column within the colgroup but is not a colgroup itself. The rest of the algorithm seems to never use that again…
          // const colGroup: ColGroup = { anchor: {x: global.theTable.width - span}, width: span, element: currentCol}; // need better name! Technically not a "column group"…
          // global.theTable.colGroups.push(colGroup);
        }
      }
      // 1.4 and 1.7 done in main function
      // 2.2 and 2.3 done in main function
      return Ok.of(Builder.of(x, totalSpan, colgroup));
    }

    export interface JSON {
      [key: string]: json.JSON;

      colgroup: ColGroup.JSON;
    }
  }
}
