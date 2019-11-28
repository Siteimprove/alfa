import { Outcome } from "@siteimprove/alfa-act";

import earl from "./formatter/earl";
import json from "./formatter/json";

export type Formatter<I, T, Q> = (
  outcomes: Iterable<Outcome<I, T, Q>>
) => string;

export namespace Formatter {
  export const EARL = earl;
  export const JSON = json;
}
