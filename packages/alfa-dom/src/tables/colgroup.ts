import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

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
    return ColGroup.Building.from(element).map((colgroup) => colgroup.colgroup);
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
    if (this._x < colgroup._x) return Comparison.Smaller;
    if (this._x > colgroup._x) return Comparison.Greater;
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


  export class Building implements Equatable, Serializable {
    private readonly _colgroup: ColGroup;

    public static of(x: number, width: number, element: Element) {
      return new Building(x, width, element);
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

    public anchorAt(x: number): Building {
      return Building.of(x, this.width, this.element);
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#forming-a-table
     * global step 9.1
     */
    public static from(
      colgroup: Element,
      x: number = -1
    ): Result<Building, string> {
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
      return Ok.of(Building.of(x, totalSpan, colgroup));
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Building &&
        this._colgroup.equals(value._colgroup)
      );
    }

    public toJSON(): Building.JSON {
      return {
        colgroup: this._colgroup.toJSON(),
      };
    }
  }

  namespace Building {
    export interface JSON {
      [key: string]: json.JSON;

      colgroup: ColGroup.JSON;
    }
  }
}
