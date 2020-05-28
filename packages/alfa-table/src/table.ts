import { Cache } from "@siteimprove/alfa-cache";
import { Comparable } from "@siteimprove/alfa-comparable";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Cell } from "./cell";
import { ColumnGroup } from "./column-group";
import { Covering } from "./covering";
import { isHtmlElementWithName } from "./helpers";
import { Row } from "./row";
import { RowGroup } from "./row-group";
import { Scope } from "./scope";

const { compare } = Comparable;
const { some } = Iterable;

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#table-processing-model
 */
export class Table implements Equatable, Serializable {
  public static of(
    element: Element,
    width: number = 0,
    height: number = 0,
    cells: Iterable<Cell> = List.empty(),
    rowGroups: Iterable<RowGroup> = List.empty(),
    columnGroups: Iterable<ColumnGroup> = List.empty()
  ): Table {
    return new Table(element, width, height, cells, rowGroups, columnGroups);
  }

  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _cells: List<Cell>;
  private readonly _rowGroups: List<RowGroup>;
  private readonly _columnGroups: List<ColumnGroup>;

  private constructor(
    element: Element,
    width: number,
    height: number,
    cells: Iterable<Cell>,
    rowGroups: Iterable<RowGroup>,
    columnGroups: Iterable<ColumnGroup>
  ) {
    this._width = width;
    this._height = height;
    this._element = element;
    this._cells = List.from(cells);
    this._rowGroups = List.from(rowGroups);
    this._columnGroups = List.from(columnGroups);
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

  public get columnGroups(): Iterable<ColumnGroup> {
    return this._columnGroups;
  }

  public get rowGroups(): Iterable<RowGroup> {
    return this._rowGroups;
  }

  public equals(value: unknown): value is this {
    if (!(value instanceof Table)) return false;
    return (
      this._width === value._width &&
      this._height === value._height &&
      this._cells.equals(value._cells) &&
      this._rowGroups.equals(value._rowGroups) &&
      this._columnGroups.equals(this._columnGroups)
    );
  }

  public toJSON(): Table.JSON {
    return {
      height: this._height,
      width: this._width,
      element: this._element.toJSON(),
      cells: this._cells.toArray().map((cell) => cell.toJSON()),
      rowGroups: this._rowGroups.toArray().map((rg) => rg.toJSON()),
      colGroups: this._columnGroups.toArray().map((cg) => cg.toJSON()),
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
      cells: Iterable<Cell.Builder> = List.empty(),
      slots: Array<Array<Option<Cell.Builder>>> = [[]],
      rowGroups: Iterable<RowGroup> = List.empty(),
      colGroups: Iterable<ColumnGroup> = List.empty()
    ): Builder {
      return new Builder(
        element,
        width,
        height,
        cells,
        slots,
        rowGroups,
        colGroups
      );
    }

    // The product will always have empty cells list as it's stored here
    private readonly _table: Table;
    private readonly _cells: List<Cell.Builder>;
    private readonly _slots: Array<Array<Option<Cell.Builder>>>;

    private constructor(
      element: Element,
      width: number,
      height: number,
      cells: Iterable<Cell.Builder>,
      slots: Array<Array<Option<Cell.Builder>>>,
      rowGroups: Iterable<RowGroup>,
      colGroups: Iterable<ColumnGroup>
    ) {
      this._table = Table.of(
        element,
        width,
        height,
        List.empty(),
        rowGroups,
        colGroups
      );
      this._cells = List.from(cells);
      this._slots = slots;
    }

    public get cells(): Iterable<Cell.Builder> {
      return this._cells;
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

    public get colGroups(): Iterable<ColumnGroup> {
      return this._table.columnGroups;
    }

    public get rowGroups(): Iterable<RowGroup> {
      return this._table.rowGroups;
    }

    public get table(): Table {
      return Table.of(
        this.element,
        this.width,
        this.height,
        this._cells.map((cell) => cell.cell),
        List.from(this.rowGroups),
        List.from(this.colGroups)
      );
    }

    public slot(x: number, y: number): Option<Cell.Builder> {
      return this._slots[x] !== undefined || this._slots[x][y] !== undefined
        ? None
        : this._slots[x][y];
    }

    public update(update: {
      element?: Element;
      width?: number;
      height?: number;
      cells?: List<Cell.Builder>;
      slots?: Array<Array<Option<Cell.Builder>>>;
      rowGroups?: List<RowGroup>;
      colGroups?: List<ColumnGroup>;
    }): Builder {
      const table = Builder.of(
        update.element !== undefined ? update.element : this.element,
        update.width !== undefined ? update.width : this.width,
        update.height !== undefined ? update.height : this.height,
        update.cells !== undefined ? update.cells : this._cells,
        update.slots !== undefined ? update.slots : this._slots,
        update.rowGroups !== undefined
          ? update.rowGroups
          : List.from(this.rowGroups),
        update.colGroups !== undefined
          ? update.colGroups
          : List.from(this.colGroups)
      );

      return update.cells !== undefined
        ? // aggressively keep slots in sync if any cells has been modified.
          table.updateSlots(...update.cells)
        : table;
    }

    public updateSlots(...cells: Array<Cell.Builder>): Builder {
      for (const cell of cells) {
        for (let x = cell.anchor.x; x < cell.anchor.x + cell.width; x++) {
          if (this._slots[x] === undefined) {
            this._slots[x] = [];
          }
          for (let y = cell.anchor.y; y < cell.anchor.y + cell.height; y++) {
            this._slots[x][y] = Some.of(cell);
          }
        }
      }

      return this; // for chaining
    }

    public addCells(cells: Iterable<Cell.Builder>): Builder {
      return this.update({ cells: this._cells.concat(cells) });
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
              cells: this._cells.concat(rowGroup.cells),
              // add new group
              rowGroups: List.from(this.rowGroups).append(rowGroup.rowgroup),
            });
          } else {
            return this;
          }
        });
    }

    public hasDataCellCoveringArea(
      x: number,
      y: number,
      w: number,
      h: number
    ): boolean {
      return some(this.cells, (cell) => cell.isDataCoveringArea(x, y, w, h));
    }

    public addHeadersVariants(): Builder {
      return this.update({
        cells: List.from(this.cells).map((cell) =>
          cell.addHeaderVariant(
            this.hasDataCellCoveringArea.bind(this),
            this.width,
            this.height
          )
        ),
      });
    }

    /**
     * If principal cell is in a group, get all group headers that are in this group and above+lift of principal cell.
     */
    public getAboveLeftGroupHeaders(
      kind: "row" | "column"
    ): (principalCell: Cell.Builder) => Iterable<Cell.Builder> {
      let anchor: "x" | "y",
        groups: Iterable<Covering>,
        groupHeaders: Iterable<Cell.Builder>;

      switch (kind) {
        case "row":
          anchor = "y";
          groups = this.rowGroups;
          groupHeaders = List.from(this.cells).filter((cell) =>
            cell.variant.equals(Some.of(Scope.RowGroup))
          );
          break;
        case "column":
          anchor = "x";
          groups = this.colGroups;
          groupHeaders = List.from(this.cells).filter((cell) =>
            cell.variant.equals(Some.of(Scope.ColumnGroup))
          );
          break;
      }

      return (principalCell) => {
        // The group covering the same anchor as the principal cell
        const principalGroup = Iterable.find(groups, (group) =>
          group.isCovering(principalCell.anchor[anchor])
        );

        return principalGroup.isSome()
          ? // if the cell is in a group,
            Iterable.filter(
              // get all group headers
              groupHeaders,
              (cell) =>
                // keep the ones inside the group of the cell
                principalGroup.get().isCovering(cell.anchor[anchor]) &&
                // keep the ones that are above and left of the cell
                cell.anchor.x < principalCell.anchor.x + principalCell.width &&
                cell.anchor.y < principalCell.anchor.y + principalCell.height
            )
          : [];
      };
    }

    public assignHeaders(): Builder {
      return this.update({
        cells: List.from(this.cells).map((cell) =>
          cell.assignHeaders(
            this.element,
            (x: number, y: number) => this._slots[x][y],
            this.getAboveLeftGroupHeaders("row"),
            this.getAboveLeftGroupHeaders("column")
          )
        ),
      });
    }

    public equals(value: unknown): value is this {
      if (!(value instanceof Builder)) return false;
      return (
        this._cells.equals(value._cells) &&
        this._slots.every((array, x) =>
          array.every((option, y) => option.equals(value._slots[x][y]))
        ) &&
        this._table.equals(value._table)
      );
    }

    public toJSON(): Builder.JSON {
      return {
        table: this._table.toJSON(),
        cells: this._cells.toArray().map((cell) => cell.toJSON()),
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
              colGroups: List.from(table.colGroups).append(colGroup),
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
            List.from(table.cells),
            List.from(growingCellsList),
            yCurrent,
            table.width
          ).get();
          growingCellsList = [...row.downwardGrowingCells];
          table = table.update({
            cells: List.from(table.cells).concat(row.cells),
            height: Math.max(table.height, yCurrent + 1),
            width: Math.max(table.width, row.width),
          });
          // row processing steps 4/16
          yCurrent++;

          continue;
        }

        // 14
        // Ending row group 1
        // Slots are NOT in sync after this step.
        growingCellsList = growingCellsList.map((cell) =>
          cell.growDownward(table.height - 1)
        );
        yCurrent = table.height;
        // Ending row group 2
        // Slots are sync again after this step.
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
            List.from(table.cells).some(
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
            List.from(table.cells).some(
              (cell) => cell.anchor.x === col && cell.anchor.y === row
            );
        }
        if (!colCovered) return Err.of(`col ${col} has no cell anchored in it`);
      }
      // Checking for row forming algorithm step 13 (slot covered twice)
      for (let x = 0; x < table.width; x++) {
        for (let y = 0; y < table.height; y++) {
          if (List.from(table.cells).filter((cell) => cell.isCovering(x, y)).size > 1) {
            return Err.of(`Slot (${x}, ${y}) is covered twice`);
          }
        }
      }

      // 21

      // The slots array might be sparse (or at least have holes) if some slots are not covered.
      // We first turn it into a dense array to allow array-operation optimisations
      // and make access easier to handle (slots[x][y] is never undefined after this).
      const slots: Array<Array<Option<Cell.Builder>>> = new Array(table.width);
      for (let x = 0; x < table.width; x++) {
        slots[x] = new Array(table.height);
        for (let y = 0; y < table.height; y++) {
          slots[x][y] = table.slot(x, y);
        }
      }
      table = table.update({ slots });

      // Second, we need to compute all headers variant.
      // This need to be done separately so that the updated table is used in assignHeaders.
      table = table.addHeadersVariants();
      // Third, we assign headers to cells
      table = table.assignHeaders();

      // Finally, we sort lists and export the result.
      table = table.update({
        cells: List.from([...table.cells].sort(compare)),
        rowGroups: List.from([...table.rowGroups].sort(compare)),
        colGroups: List.from([...table.colGroups].sort(compare)),
      });
      return Ok.of(table);
    }
  }
}
