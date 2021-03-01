import {
  Current,
  Keyword,
  Length,
  Percentage,
  RGB,
  System,
  Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";

import * as css from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

import { List } from "./value/list";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Keyword<"none">
  | Keyword<"capitalize">
  | Keyword<"uppercase">
  | Keyword<"lowercase">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "none",
  "capitalize",
  "uppercase",
  "lowercase"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform}
 */
export default Property.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (textTransform) => textTransform,
  {
    inherits: true,
  }
);
