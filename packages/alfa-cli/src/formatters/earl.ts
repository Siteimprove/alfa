import { Aspect, Target, toJSON } from "@siteimprove/alfa-act";

import { Formatter } from "../types";

export function EARL<A extends Aspect, T extends Target>(): Formatter<A, T> {
  return function EARL(results, aspects) {
    return JSON.stringify(toJSON(results, aspects), null, 2);
  };
}
