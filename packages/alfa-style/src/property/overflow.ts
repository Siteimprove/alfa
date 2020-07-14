import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Record } from "@siteimprove/alfa-record";

import { Property } from "../property";

const { map, option, pair, delimited } = Parser;

export namespace Overflow {
  export type X = Keyword<"visible" | "hidden" | "clip" | "scroll" | "auto">;

  /**
   * @see https://drafts.csswg.org/css-overflow/#propdef-overflow-x
   */
  export const X: Property<X> = Property.of(
    Keyword.of("visible"),
    Keyword.parse("visible", "hidden", "clip", "scroll", "auto"),
    (style) =>
      style.specified("overflow-x").map((x) => {
        if (x.value !== "visible" && x.value !== "clip") {
          return x;
        }

        const { value: y } = style.specified("overflow-y");

        if (y.value === "visible" || y.value === "clip") {
          return x;
        }

        return Keyword.of(x.value === "visible" ? "auto" : "hidden");
      })
  );

  export type Y = Keyword<"visible" | "hidden" | "clip" | "scroll" | "auto">;

  /**
   * @see https://drafts.csswg.org/css-overflow/#propdef-overflow-y
   */
  export const Y: Property<Y> = Property.of(
    Keyword.of("visible"),
    Keyword.parse("visible", "hidden", "clip", "scroll", "auto"),
    (style) =>
      style.specified("overflow-y").map((y) => {
        if (y.value !== "visible" && y.value !== "clip") {
          return y;
        }

        const { value: x } = style.specified("overflow-x");

        if (x.value === "visible" || x.value === "clip") {
          return y;
        }

        return Keyword.of(y.value === "visible" ? "auto" : "hidden");
      })
  );

  /**
   * @see https://drafts.csswg.org/css-overflow/#propdef-overflow
   */
  export const Shorthand = Property.Shorthand.of(
    ["overflow-x", "overflow-y"],
    map(
      pair(X.parse, option(delimited(option(Token.parseWhitespace), Y.parse))),
      (result) => {
        const [x, y] = result;

        return Record.of({
          "overflow-x": x,
          "overflow-y": y.getOr(x),
        });
      }
    )
  );
}
