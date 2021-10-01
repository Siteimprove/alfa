import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Property } from "../property";

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
  Property.of<Specified, Computed>(Keyword.of("none"), parse, (float) => float)
);
