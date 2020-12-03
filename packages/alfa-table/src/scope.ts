import { Element } from "@siteimprove/alfa-dom";

/**
 * @see https://html.spec.whatwg.org/#attr-th-scope
 */
export enum Scope {
  Row = "row",
  RowGroup = "row-group",
  Column = "column",
  ColumnGroup = "column-group",
  Auto = "auto",
}

export namespace Scope {
  export type Resolved = Exclude<Scope, Scope.Auto>;

  export function from(element: Element): Scope {
    return element
      .attribute("scope")
      .flatMap((attribute) =>
        attribute.enumerate("row", "rowgroup", "col", "colgroup")
      )
      .map((scope) => {
        switch (scope) {
          case "row":
            return Scope.Row;
          case "rowgroup":
            return Scope.RowGroup;
          case "col":
            return Scope.Column;
          case "colgroup":
            return Scope.ColumnGroup;
        }
      })
      .getOr(Scope.Auto);
  }
}
