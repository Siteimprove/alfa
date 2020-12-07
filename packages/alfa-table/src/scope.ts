import { Element } from "@siteimprove/alfa-dom";

/**
 * @see https://html.spec.whatwg.org/#attr-th-scope
 */
export type Scope = "row" | "row-group" | "column" | "column-group" | "auto";

export namespace Scope {
  export function from(element: Element): Scope {
    return element
      .attribute("scope")
      .flatMap((attribute) =>
        attribute.enumerate("row", "rowgroup", "col", "colgroup")
      )
      .map((scope) => {
        switch (scope) {
          case "row":
            return "row";
          case "rowgroup":
            return "row-group";
          case "col":
            return "column";
          case "colgroup":
            return "column-group";
        }
      })
      .getOr("auto");
  }
}
