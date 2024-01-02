import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Iterable } from "@siteimprove/alfa-iterable";
import type { Serializable } from "@siteimprove/alfa-json";

import type { Matchable } from "./matchable";

/**
 * @internal
 */
export interface Feature<T>
  extends Equatable,
    Matchable,
    Serializable<Serializable.ToJSON<T>>,
    Iterable<T> {}
