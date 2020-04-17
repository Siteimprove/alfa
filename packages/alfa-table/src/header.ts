export namespace Header {
  /**
   * State of the scope attribute
   * @see https://html.spec.whatwg.org/multipage/tables.html#attr-th-scope
   */
  export enum Scope {
    Auto = "auto",
    Row = "row",
    Column = "column",
    RowGroup = "row-group",
    ColumnGroup = "column-group",
  }

  /**
   * "header variant" of the cell. Same as the scope except that "Auto" needs to be resolved.
   * @see https://html.spec.whatwg.org/multipage/tables.html#column-header
   * and following defs
   */
  export enum Variant {
    Row = "row",
    Column = "column",
    RowGroup = "row-group",
    ColumnGroup = "column-group",
  }
}
