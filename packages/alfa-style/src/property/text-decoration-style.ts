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
  | Keyword<"solid">
  | Keyword<"double">
  | Keyword<"dotted">
  | Keyword<"dashed">
  | Keyword<"wavy">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "solid",
  "double",
  "dotted",
  "dashed",
  "wavy"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style}
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("solid"),
  parse,
  (textDecorationStyle) => textDecorationStyle
);
