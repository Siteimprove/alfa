import { Token } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hashable } from "@siteimprove/alfa-hash";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { List } from "./list";

export namespace Media {
  export interface Queryable extends Equatable, Hashable, json.Serializable {
    matches: Predicate<Device>;
  }

  export enum Comparator {
    GreaterThan = ">",
    GreaterThanEqual = ">=",
    LessThan = "<",
    LessThanEqual = "<=",
  }

  export function parse(input: Slice<Token>) {
    return List.parse(input)
      .flatMap(([tokens, selector]) => {
        const result: Result<List, string> =
          tokens.length === 0 ? Ok.of(selector) : Err.of("Unexpected token");

        return result;
      })
      .ok();
  }
}
