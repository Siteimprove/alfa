/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#attr-th-scope
 */
export enum Scope {
  Auto = "auto",
  Row = "row",
  Column = "column",
  RowGroup = "row-group",
  ColumnGroup = "column-group",
}

export namespace Scope {
  export type Resolved = Exclude<Scope, Scope.Auto>;
}
