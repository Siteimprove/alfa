import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";

/**
 * @public
 */
export interface Matchable {
  readonly matches: Predicate<Device>;
}
