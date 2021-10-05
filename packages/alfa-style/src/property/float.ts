import { Keyword } from "@siteimprove/alfa-css";
import { Property } from "../property";
import { Value } from "../value";

declare module "../property" {
  interface Longhands {
    float: Property<Specified, Computed>;
  }
}

type keywords = Keyword<"none"> | Keyword<"left"> | Keyword<"right">;

/**
 * @internal
 */
export type Specified = keywords;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("none", "left", "right");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/float}
 * @internal
 */

export default Property.register(
  "float",
  Property.of<Specified, Computed>(Keyword.of("none"), parse, (value, style) =>
    style.computed("position").value.equals(Keyword.of("absolute")) ||
    style.computed("position").value.equals(Keyword.of("fixed"))
      ? value
      : Value.of(Keyword.of("none"))
  )
);
