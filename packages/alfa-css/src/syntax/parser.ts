import type { Parser as alfaParser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import type { Token } from "./token.js";

/**
 * @public
 */
export type Parser<V> = alfaParser<Slice<Token>, V, string>;
