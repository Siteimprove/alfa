import { Cache } from "@siteimprove/alfa-cache";
import { Comparable } from "@siteimprove/alfa-comparable";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Cell } from "./cell";
import { ColumnGroup } from "./column-group";
import { isHtmlElementWithName } from "./helpers";
import { Row } from "./row";
import { RowGroup } from "./row-group";

const { compare } = Comparable;

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#table-processing-model
 */
export class Table implements Equatable, Serializable {
  public static of(
    element: Element,
    width: number = 0,
    height: number = 0,
    cells: Array<Cell> = [],
    slots: Array<Array<Cell>> = [[]],
    rowGroups: Array<RowGroup> = [],
    columnGroups: Array<ColumnGroup> = []
  ): Table {
    return new Table(element, width, height, cells, slots, rowGroups, columnGroups);
  }

  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _cells: Array<Cell>;
  private readonly _slots: Array<Array<Cell>>;
  private readonly _rowGroups: Array<RowGroup>;
  private readonly _columnGroups: Array<ColumnGroup>;

  private constructor(
    element: Element,
    width: number,
    height: number,
    cells: Array<Cell>,
    slots: Array<Array<Cell>>,
    rowGroups: Array<RowGroup>,
    columnGroups: Array<ColumnGroup>
  ) {
    this._width = width;
    this._height = height;
    this._element = element;
    this._cells = cells;
    this._slots = slots;
    this._rowGroups = rowGroups;
    this._columnGroups = columnGroups;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get element(): Element {
    return this._element;
  }

  public get cells(): Iterable<Cell> {
    return this._cells;
  }

  public get columnGroups(): Array<ColumnGroup> {
    return this._columnGroups;
  }

  public get rowGroups(): Array<RowGroup> {
    return this._rowGroups;
  }

  public equals(value: unknown): value is this {
    if (!(value instanceof Table)) return false;
    return (
      this._width === value._width &&
      this._height === value._height &&
      this._cells.length === value._cells.length &&
      this._cells.every((cell, idx) => cell.equals(value._cells[idx])) &&
      this._rowGroups.length === value._rowGroups.length &&
      this._rowGroups.every((rowGroup, idx) =>
        rowGroup.equals(value._rowGroups[idx])
      ) &&
      this._columnGroups.length === value._columnGroups.length &&
      this._columnGroups.every((colGroup, idx) =>
        colGroup.equals(this._columnGroups[idx])
      )
    );
  }

  public toJSON(): Table.JSON {
    return {
      height: this._height,
      width: this._width,
      element: this._element.toJSON(),
      cells: this._cells.map((cell) => cell.toJSON()),
      rowGroups: this._rowGroups.map((rg) => rg.toJSON()),
      colGroups: this._columnGroups.map((cg) => cg.toJSON()),
    };
  }
}

export namespace Table {
  const cache = Cache.empty<Element, Result<Table, string>>();

  export function from(element: Element): Result<Table, string> {
    return cache.get(element, () =>
      Builder.from(element).map((table) => table.table)
    );
  }

  export interface JSON {
    [key: string]: json.JSON;
    height: number;
    width: number;
    element: Element.JSON;
    cells: Cell.JSON[];
    rowGroups: RowGroup.JSON[];
    colGroups: ColumnGroup.JSON[];
  }

  export class Builder implements Equatable, Serializable {
    public static of(
      element: Element,
      width: number = 0,
      height: number = 0,
      cells: Array<Cell.Builder> = [],
      slots: Array<Array<Cell.Builder>> = [[]],
      rowGroups: Array<RowGroup> = [],
      colGroups: Array<ColumnGroup> = []
    ): Builder {
      return new Builder(element, width, height, cells, slots, rowGroups, colGroups);
    }

    // The product will always have empty cells list as it's stored here
    // The product will always have empty slots array as it's stored here
    private readonly _table: Table;
    private readonly _cells: Array<Cell.Builder>;
    private readonly _slots: Array<Array<Cell.Builder>>;

    private constructor(
      element: Element,
      width: number,
      height: number,
      cells: Array<Cell.Builder>,
      slots: Array<Array<Cell.Builder>>,
      rowGroups: Array<RowGroup>,
      colGroups: Array<ColumnGroup>
    ) {
      this._table = Table.of(element, width, height, [], [[]], rowGroups, colGroups);
      this._cells = cells;
      this._slots = slots;
    }

    public get cells(): Array<Cell.Builder> {
      return this._cells;
    }

    public get slots(): Array<Array<Cell.Builder>> {
      return this._slots;
    }

    public get width(): number {
      return this._table.width;
    }

    public get height(): number {
      return this._table.height;
    }

    public get element(): Element {
      return this._table.element;
    }

    public get colGroups(): Array<ColumnGroup> {
      return this._table.columnGroups;
    }

    public get rowGroups(): Array<RowGroup> {
      return this._table.rowGroups;
    }

    public get table(): Table {
      return Table.of(
        this.element,
        this.width,
        this.height,
        this._cells.map((cell) => cell.cell),
        this._slots.map(array => array.map((cell) => cell.cell)),
        this.rowGroups,
        this.colGroups
      );
    }

    public update(update: {
      element?: Element;
      width?: number;
      height?: number;
      cells?: Array<Cell.Builder>;
      rowGroups?: Array<RowGroup>;
      colGroups?: Array<ColumnGroup>;
    }): Builder {
      return Builder.of(
        update.element !== undefined ? update.element : this.element,
        update.width !== undefined ? update.width : this.width,
        update.height !== undefined ? update.height : this.height,
        update.cells !== undefined ? update.cells : this._cells,
        this._slots,
        update.rowGroups !== undefined ? update.rowGroups : this.rowGroups,
        update.colGroups !== undefined ? update.colGroups : this.colGroups
      );
    }

    public addCells(cells: Iterable<Cell.Builder>): Builder {
      return this.update({ cells: this._cells.concat(...cells) });
    }

    public addRowGroupFromElement(
      rowgroup: Element,
      yCurrent: number
    ): Result<Builder, string> {
      return RowGroup.Builder.from(rowgroup)
        .map((rowGroup) => rowGroup.anchorAt(yCurrent))
        .map((rowGroup) => {
          if (rowGroup.height > 0) {
            return this.update({
              // adjust table height and width
              height: Math.max(this.height, this.height + rowGroup.height),
              width: Math.max(this.width, rowGroup.width),
              // merge in new cells
              cells: this._cells.concat(...rowGroup.cells),
              // add new group
              rowGroups: this.rowGroups.concat(rowGroup.rowgroup),
            });
          } else {
            return this;
          }
        });
    }

    public equals(value: unknown): value is this {
      if (!(value instanceof Builder)) return false;
      return (
        this._cells.length === value._cells.length &&
        this._cells.every((cell, idx) => cell.equals(value._cells[idx])) &&
        this._table.equals(value._table)
      );
    }

    public toJSON(): Builder.JSON {
      return {
        table: this._table.toJSON(),
        cells: this._cells.map((cell) => cell.toJSON()),
      };
    }
  }

  export namespace Builder {
    export interface JSON {
      [key: string]: json.JSON;
      table: Table.JSON;
      cells: Cell.Builder.JSON[];
    }

    export function from(element: Element): Result<Builder, string> {
      if (element.name !== "table")
        return Err.of("This element is not a table");

      // 1, 2, 4, 11
      let table = Builder.of(element);
      // 3
      let pendingTfoot: Array<Element> = [];
      // 5 + 8 + 9.3
      let children = element
        .children()
        .filter(
          isHtmlElementWithName("colgroup", "thead", "tbody", "tfoot", "tr")
        );
      // 6
      // skipping caption for now

      // 10
      let yCurrent = 0;

      // 11
      let growingCellsList: Array<Cell.Builder> = [];

      let processCG = true;
      for (const currentElement of children) {
        // loop control is 7 + 9.2 + 13 (advance) + 15 (advance) + 17 + 18

        if (currentElement.name === "colgroup") {
          // 9.1 (Columns group)
          if (processCG) {
            const colGroup = ColumnGroup.Builder.from(currentElement)
              .get()
              .anchorAt(table.width).columnGroup;
            table = table.update({
              // 9.1 (1).4 (cumulative) and (2).2
              width: Math.max(table.width, table.width + colGroup.width),
              // 9.1 (1).7 and (2).3
              colGroups: table.colGroups.concat(colGroup),
            });
          }
          continue;
        }

        // 12
        processCG = false;

        if (currentElement.name === "tr") {
          // 13 (process) can detect new downward growing cells

          const row = Row.Builder.from(
            currentElement,
            table.cells,
            growingCellsList,
            yCurrent,
            table.width
          ).get();
          growingCellsList = [...row.downwardGrowingCells];
          table = table.update({
            cells: table.cells.concat(...row.cells),
            height: Math.max(table.height, yCurrent + 1),
            width: Math.max(table.width, row.width),
          });
          // row processing steps 4/16
          yCurrent++;

          continue;
        }

        // 14
        // Ending row group 1
        growingCellsList = growingCellsList.map((cell) =>
          cell.growDownward(table.height - 1)
        );
        yCurrent = table.height;
        // Ending row group 2
        table = table.addCells(growingCellsList);
        growingCellsList = [];

        if (currentElement.name === "tfoot") {
          // 15 (add to list)
          pendingTfoot.push(currentElement);
        }

        if (
          currentElement.name === "thead" ||
          currentElement.name === "tbody"
        ) {
          // 16
          // process row group and anchor cells
          table = table.addRowGroupFromElement(currentElement, yCurrent).get();
          yCurrent = table.height;
        }
      }

      // 19
      for (const tfoot of pendingTfoot) {
        table = table.addRowGroupFromElement(tfoot, yCurrent).get();
        yCurrent = table.height;
      }
      // 20
      // Of course, errors are more or less caught and repaired by browsers.
      // Note that having a rowspan that extends out of the row group is not a table error per se!
      // checking for rows
      for (let row = 0; row < table.height; row++) {
        let rowCovered = false;
        for (let col = 0; !rowCovered && col < table.width; col++) {
          rowCovered =
            rowCovered ||
            table.cells.some(
              (cell) => cell.anchor.x === col && cell.anchor.y === row
            );
        }
        if (!rowCovered) return Err.of(`row ${row} has no cell anchored in it`);
      }
      // checking for cols
      for (let col = 0; col < table.width; col++) {
        let colCovered = false;
        for (let row = 0; !colCovered && row < table.height; row++) {
          colCovered =
            colCovered ||
            table.cells.some(
              (cell) => cell.anchor.x === col && cell.anchor.y === row
            );
        }
        if (!colCovered) return Err.of(`col ${col} has no cell anchored in it`);
      }
      // Checking for row forming algorithm step 13 (slot covered twice)
      for (let x = 0; x < table.width; x++) {
        for (let y = 0; y < table.height; y++) {
          if (table.cells.filter((cell) => cell.isCovering(x, y)).length > 1) {
            return Err.of(`Slot (${x}, ${y}) is covered twice`);
          }
        }
      }

      // 21

      // We need to compute all headers variant first and this need to be done separately
      // so that the updated table is used in assignHeaders
      table = table.update({
        cells: table.cells.map((cell) => cell.addHeaderVariant(table)),
      });

      return Ok.of(
        table.update({
          cells: table.cells
            .map((cell) => cell.assignHeaders(table))
            .sort(compare),
          colGroups: table.colGroups.sort(compare),
          rowGroups: table.rowGroups.sort(compare),
        })
      );
    }
  }
}
