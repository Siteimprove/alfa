import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Widget, SectionHead } from "../abstract";
import { TabList } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#tab
 */
export const Tab: Role = {
  name: "tab",
  inherits: [SectionHead, Widget],
  context: [TabList],
  supported: [
    Attributes.PositionInSet,
    Attributes.Selected,
    Attributes.SetSize
  ],
  label: { from: ["contents", "author"] }
};
