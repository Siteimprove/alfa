import { Cache } from "@siteimprove/alfa-cache";
import { Comparable } from "@siteimprove/alfa-comparable";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Real } from "@siteimprove/alfa-math";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as json from "@siteimprove/alfa-json";

import { Cell } from "./cell";
import { Column } from "./column";
import { Row } from "./row";
import { Group } from "./group";
import { Slot } from "./slot";
import { Scope } from "./scope";

const { isNaN } = Number;
const { clamp } = Real;
const { not, equals } = Predicate;
const { hasId, hasName, isElement } = Element;
const { compare } = Comparable;
const { hasElement } = Cell;

/**
 * @see https://html.spec.whatwg.org/#concept-table
 */
export class Table implements Equatable, Serializable {
  public static of(
    element: Element,
    cells: Iterable<Cell>,
    groups: Iterable<Group>
  ): Table {
    return new Table(
      element,
      Array.from(cells).sort(compare),
      Array.from(groups).sort(compare)
    );
  }

  public static empty(element: Element): Table {
    return new Table(element, [], []);
  }

  private readonly _element: Element;
  private readonly _cells: Array<Cell>;
  private readonly _groups: Array<Group>;

  private constructor(
    element: Element,
    cells: Array<Cell>,
    groups: Array<Group>
  ) {
    this._element = element;
    this._cells = cells;
    this._groups = groups;
  }

  public get element(): Element {
    return this._element;
  }

  public get cells(): Sequence<Cell> {
    return Sequence.from(this._cells);
  }

  public get groups(): Sequence<Group> {
    return Sequence.from(this._groups);
  }

  public isEmpty(): boolean {
    return this._cells.length === 0;
  }

  public equals(table: Table): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Table &&
      value._element.equals(this._element) &&
      value._cells.length === this._cells.length &&
      value._cells.every((cell, i) => cell.equals(this._cells[i]))
    );
  }

  public toJSON(): Table.JSON {
    return {
      element: this._element.path(),
      cells: this._cells.map((cell) => cell.toJSON()),
      groups: this._groups.map((group) => group.toJSON()),
    };
  }
}

export namespace Table {
  export interface JSON {
    [key: string]: json.JSON;
    element: string;
    cells: Array<Cell.JSON>;
    groups: Array<Group.JSON>;
  }

  const cache = Cache.empty<Element, Table>();

  export function from(element: Element): Table {
    return cache.get(element, () => formTable(element));
  }

  /**
   * @see https://html.spec.whatwg.org/#forming-a-table
   */
  function formTable(element: Element): Table {
    // 1
    let xWidth = 0;

    // 2
    let yHeight = 0;

    // 3
    let footers: Array<Element> = [];

    // 4
    let cells: Array<Cell> = [];
    let groups: Array<Group> = [];

    // We model tables as an array of rows with each row containing an array of
    // columns and each column containing an array of cell indices.
    //
    // Tables are indexed first by row and then by column. This way, rows are
    // aligned vertically and columns horizontally:
    //
    //   table = [
    //     /* row 1 */ [/* column 1 */, /* column 2 */],
    //     /* row 2 */ [/* column 1 */, /* column 2 */],
    //   ]
    //
    // This makes it considerably easier to debug table construction by not
    // having to rotate your screen 90 degrees to make sense of things.
    let table: Array<Array<Array<number>>> = [];

    // In addition to the list of cells and the table grid, we also keep track
    // of which columns and rows have data cells. This information is used when
    // determining the scope of header cells.
    const data = { x: new Set<number>(), y: new Set<number>() };

    // 5
    if (element.children().isEmpty()) {
      return Table.of(element, cells, groups);
    }

    // 6
    // Nothing to do

    // 7
    let children = element.children().filter(isElement);

    // 8
    skip(not(hasName("colgroup", "thead", "tbody", "tfoot", "tr")));

    // 9
    while (current().some(hasName("colgroup"))) {
      // 9.1
      // As this step contains several substeps inlined in the algorithm, its
      // substeps have been extracted into a function of their own.
      processColumnGroup(current().get());

      // 9.2
      advance();

      // 9.3
      skip(not(hasName("colgroup", "thead", "tbody", "tfoot", "tr")));

      // 9.4
      // Nothing to do
    }

    // 10
    let yCurrent = 0;

    // 11
    let downwardGrowing: Array<[cell: Cell, index: number]> = [];

    // Steps 12-18 are repeated for as long as there are children left in the
    // table.
    while (current().isSome()) {
      // 12
      skip(not(hasName("thead", "tbody", "tfoot", "tr")));

      // 13
      if (current().some(hasName("tr"))) {
        processRow(current().get());
        advance();
        continue;
      }

      // 14
      endRowGroup();

      // 15
      if (current().some(hasName("tfoot"))) {
        footers.push(current().get());
        advance();
        continue;
      }

      // 16
      processRowGroup(current().get());

      // 17
      advance();

      // 18
      // Nothing to do
    }

    // 19
    footers.forEach(processRowGroup);

    // 20
    // Nothing to do

    // 21
    // Before returning the final table, we go through all cells and assign them
    // scopes and headers, if any.
    return Table.of(element, cells.map(assignScope).map(assignHeaders), groups);

    /**
     * Ensure that the given position is available in the table.
     */
    function ensure(x: number, y: number): void {
      for (let i = table.length - 1; i < y; i++) {
        table.push([]);
      }

      const row = table[y];

      for (let i = row.length - 1; i < x; i++) {
        row.push([]);
      }
    }

    /**
     * Get the cells at the given position.
     */
    function get(x: number, y: number): Array<number> {
      ensure(x, y);

      // Keep in mind that tables are indexed first by row and then by column.
      return table[y][x];
    }

    /**
     * Check if the table has cells at the given position.
     */
    function has(x: number, y: number): boolean {
      return get(x, y).length > 0;
    }

    /**
     * Add a cell at the given position.
     */
    function add(x: number, y: number, i: number): number {
      if (cells[i].isData()) {
        data.x.add(x);
        data.y.add(y);
      }

      ensure(x, y);

      // Keep in mind that tables are indexed first by row and then by column.
      return table[y][x].push(i);
    }

    /**
     * Get the current child element of the table.
     */
    function current(): Option<Element> {
      return children.first();
    }

    /**
     * Advance to the next child element of the table.
     */
    function advance(): Option<Element> {
      children = children.rest();
      return current();
    }

    /**
     * Skip child elements of the table while the predicate holds.
     */
    function skip(predicate: Predicate<Element>): void {
      while (current().some(predicate)) {
        advance();
      }
    }

    /**
     * @see https://html.spec.whatwg.org/#algorithm-for-processing-row-groups
     */
    function processRowGroup(element: Element): void {
      // 1
      const yStart = yHeight;

      // 2
      element
        .children()
        .filter(isElement)
        .filter(hasName("tr"))
        .forEach(processRow);

      // 3
      if (yHeight > yStart) {
        const group = Row.group(yStart, yHeight - yStart);

        groups.push(group);

        // Todo
      }

      // 4
      endRowGroup();
    }

    /**
     * @see https://html.spec.whatwg.org/#algorithm-for-ending-a-row-group
     */
    function endRowGroup(): void {
      // 1
      while (yCurrent < yHeight) {
        // 1.1
        growCells();

        // 1.2
        yCurrent++;
      }

      // 2
      downwardGrowing = [];
    }

    /**
     * @see https://html.spec.whatwg.org/#algorithm-for-processing-rows
     */
    function processRow(element: Element): void {
      // 1
      if (yHeight === yCurrent) {
        yHeight++;
      }

      // 2
      let xCurrent = 0;

      // 3
      growCells();

      // 4
      let children = element
        .children()
        .filter(isElement)
        .filter(hasName("td", "th"));

      if (children.isEmpty()) {
        yCurrent++;
        return;
      }

      // 5
      // Nothing to do

      // Steps 6-18 are repeated for as long as there are children left in the
      // row.
      while (current().isSome()) {
        // 6
        while (xCurrent < xWidth && has(xCurrent, yCurrent)) {
          xCurrent++;
        }

        // 7
        if (xCurrent === xWidth) {
          xWidth++;
        }

        // 8
        let colspan = integerValue(
          current().get(),
          "colspan",
          1 /* lower */,
          1000 /* upper */
        );

        // 9
        let rowspan = integerValue(
          current().get(),
          "rowspan",
          0 /* lower */,
          65534 /* upper */,
          1 /* missing */
        );

        // 10
        let growsDownward: boolean;

        if (rowspan === 0) {
          growsDownward = true;
          rowspan = 1;
        } else {
          growsDownward = false;
        }

        // 11
        if (xWidth < xCurrent + colspan) {
          xWidth = xCurrent + colspan;
        }

        // 12
        if (yHeight < yCurrent + rowspan) {
          yHeight = yCurrent + rowspan;
        }

        // 13
        let cell: Cell;

        if (current().some(hasName("th"))) {
          cell = Cell.header(
            current().get(),
            Slot.of(xCurrent, yCurrent),
            colspan,
            rowspan
          );
        } else {
          cell = Cell.data(
            current().get(),
            Slot.of(xCurrent, yCurrent),
            colspan,
            rowspan
          );
        }

        const i = cells.length;

        cells.push(cell);

        for (let x = xCurrent, n = x + colspan; x < n; x++) {
          for (let y = yCurrent, n = y + rowspan; y < n; y++) {
            add(x, y, i);
          }
        }

        // 14
        if (growsDownward) {
          downwardGrowing.push([cell, i]);
        }

        // 15
        xCurrent += colspan;

        // 16
        if (advance().isNone()) {
          yCurrent++;
          return;
        }

        // 17
        // Nothing to do

        // 18
        // Nothing to do
      }

      /**
       * Get the current child element of the row.
       */
      function current(): Option<Element> {
        return children.first();
      }

      /**
       * Advance to the next child element of the row.
       */
      function advance(): Option<Element> {
        children = children.rest();
        return current();
      }
    }

    /**
     * Carry out step 9.1 of the table forming algorithm.
     *
     * @see https://html.spec.whatwg.org/#forming-a-table
     */
    function processColumnGroup(element: Element): void {
      let children = element
        .children()
        .filter(isElement)
        .filter(hasName("col"));

      if (!children.isEmpty()) {
        // 1
        const xStart = xWidth;

        // 2
        // Nothing to do

        // Steps 3-6 are repeated for as long as there are children left in the
        // column group.
        while (current().isSome()) {
          // 3
          const span = integerValue(
            current().get(),
            "span",
            1 /* lower */,
            1000 /* upper */
          );

          // 4
          xWidth += span;

          // 5
          // Nothing to do

          // 6
          advance();
        }

        // 7
        const group = Column.group(xStart, xWidth - xStart);

        groups.push(group);

        // Todo
      } else {
        // 1
        const span = integerValue(
          current().get(),
          "span",
          1 /* lower */,
          1000 /* upper */
        );

        // 2
        xWidth += span;

        // 3
        const group = Column.group(xWidth - span, span);

        groups.push(group);

        // Todo
      }

      /**
       * Get the current child element of the column group.
       */
      function current(): Option<Element> {
        return children.first();
      }

      /**
       * Advance to the next child element of the column group.
       */
      function advance(): Option<Element> {
        children = children.rest();
        return current();
      }
    }

    /**
     * For all downwards growing cells, extend their height to the current
     * y-coordinate.
     *
     * @see https://html.spec.whatwg.org/#algorithm-for-growing-downward-growing-cells
     */
    function growCells(): void {
      for (let [cell, i] of downwardGrowing) {
        const height = yCurrent - cell.y + 1;

        for (let x = cell.x, n = x + cell.width; x < n; x++) {
          for (let y = cell.y + cell.height, n = cell.y + height; y < n; y++) {
            add(x, y, i);
          }
        }

        if (cell.isHeader()) {
          cells[i] = Cell.header(cell.element, cell.anchor, cell.width, height);
        } else {
          cells[i] = Cell.data(cell.element, cell.anchor, cell.width, height);
        }
      }
    }

    /**
     * @see https://html.spec.whatwg.org/#algorithm-for-assigning-header-cells
     */
    function assignHeaders(cell: Cell): Cell {
      // 1
      const headers: Array<Cell> = [];

      // 2
      // Nothing to do

      // 3
      const ids = cell.element
        .attribute("headers")
        .map((attribute) => attribute.tokens());

      if (ids.isSome()) {
        // 3.1
        // Nothing to do

        // 3.2
        headers.push(
          ...ids
            .get()
            .collect((id) => Option.from(cells.find(hasElement(hasId(id)))))
        );
      } else {
        // 1
        // Nothing to do

        // 2
        // Nothing to do

        // 3
        for (let y = cell.y, n = y + cell.height; y < n; y++) {
          scanHeaderCells(cell, headers, cell.x, y, -1, 0);
        }

        // 4
        for (let x = cell.x, n = x + cell.width; x < n; x++) {
          scanHeaderCells(cell, headers, x, cell.y, 0, -1);
        }

        // 5
        // Todo

        // 6
        // Todo
      }

      const filtered = Sequence.from(headers)
        // 4
        .reject((cell) => cell.isEmpty())

        // 5
        .distinct()

        // 6
        .reject(equals(cell));

      const anchors = filtered.map((cell) => cell.anchor);

      // 7
      if (cell.isHeader()) {
        cell = Cell.header(
          cell.element,
          cell.anchor,
          cell.width,
          cell.height,
          anchors,
          cell.scope
        );
      } else {
        cell = Cell.data(
          cell.element,
          cell.anchor,
          cell.width,
          cell.height,
          anchors
        );
      }

      return cell;
    }

    /**
     * @see https://html.spec.whatwg.org/#internal-algorithm-for-scanning-and-assigning-header-cells
     */
    function scanHeaderCells(
      principal: Cell,
      headers: Array<Cell>,
      initialX: number,
      initialY: number,
      deltaX: number,
      deltaY: number
    ): void {
      // 1
      let x = initialX;

      // 2
      let y = initialY;

      // 3
      let opaque: Array<Cell> = [];

      // 4
      let inHeader = principal.isHeader();
      let currentHeaders = inHeader ? [principal] : [];

      // Steps 5-10 are repeated for as long as the position (x, y) is within
      // bounds of the table.
      while (true) {
        // 5
        x += deltaX;
        y += deltaY;

        // 6
        if (x < 0 || y < 0) {
          return;
        }

        // 7
        const candidates = get(x, y);

        if (candidates.length !== 1) {
          continue;
        }

        // 8
        const cell = cells[candidates[0]];

        // 9
        if (cell.isHeader()) {
          // 9.1
          inHeader = true;

          // 9.2
          currentHeaders.push(cell);

          // 9.3
          let blocked = false;

          // 9.4
          if (deltaX === 0) {
            if (
              opaque.some(
                (header) => header.x === cell.x && header.width === cell.width
              ) ||
              !isColumHeader(cell)
            ) {
              blocked = true;
            }
          } else {
            if (
              opaque.some(
                (header) => header.y === cell.y && header.height === cell.height
              ) ||
              !isRowHeader(cell)
            ) {
              blocked = true;
            }
          }

          // 9.5
          if (!blocked) {
            headers.push(cell);
          }
        } else if (inHeader) {
          inHeader = false;
          opaque.push(...currentHeaders);
          currentHeaders = [];
        }

        // 10
        // Nothing to do
      }
    }

    /**
     * @see https://html.spec.whatwg.org/#attr-th-scope
     */
    function assignScope(cell: Cell): Cell {
      if (!cell.isHeader()) {
        return cell;
      }

      let scope: Scope;

      if (isColumHeader(cell)) {
        scope = "column";
      } else if (isRowHeader(cell)) {
        scope = "row";
      } else {
        return cell;
      }

      return Cell.header(
        cell.element,
        cell.anchor,
        cell.width,
        cell.height,
        cell.headers,
        scope
      );
    }

    /**
     * @see https://html.spec.whatwg.org/#column-header
     */
    function isColumHeader(cell: Cell.Header): boolean {
      if (cell.scope === "column") {
        return true;
      }

      switch (Scope.from(cell.element)) {
        case "column":
          return true;

        case "auto":
          for (let y = cell.y, n = y + cell.height; y < n; y++) {
            if (data.y.has(y)) {
              return false;
            }
          }

          return true;
      }

      return false;
    }

    /**
     * @see https://html.spec.whatwg.org/#row-header
     */
    function isRowHeader(cell: Cell.Header): boolean {
      if (cell.scope === "row") {
        return true;
      }

      switch (Scope.from(cell.element)) {
        case "row":
          return true;

        case "auto":
          for (let x = cell.x, n = x + cell.width; x < n; x++) {
            if (data.x.has(x)) {
              return false;
            }
          }

          return true;
      }

      return false;
    }
  }

  function integerValue(
    element: Element,
    attribute: string,
    lower: number,
    upper: number,
    missing: number = lower
  ): number {
    return clamp(
      element
        .attribute(attribute)
        .map((attribute) => parseInt(attribute.value))
        .reject(isNaN)
        .getOr(missing),
      lower,
      upper
    );
  }
}
