import type { Device } from "@siteimprove/alfa-device";
import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Iterable } from "@siteimprove/alfa-iterable";
import type { JSON, Serializable } from "@siteimprove/alfa-json";
import type { Predicate } from "@siteimprove/alfa-predicate";

/**
 * @internal
 */
export interface Feature<T, J extends JSON = Serializable.ToJSON<T>>
  extends Equatable,
    Serializable<J>,
    Iterable<T> {
  readonly matches: Predicate<Device>;
}
