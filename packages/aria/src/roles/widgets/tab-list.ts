import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Composite } from "../abstract";
import { Tab } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#tablist
 */
export const TabList: Role = {
  name: "tablist",
  inherits: [Composite],
  owned: [Tab],
  supported: [
    Attributes.Level,
    Attributes.Multiselectable,
    Attributes.Orientation
  ],
  label: { from: ["author"] }
};
