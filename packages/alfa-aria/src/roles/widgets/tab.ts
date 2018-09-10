import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { SectionHead } from "../abstract/section-head";
import { Widget } from "../abstract/widget";
import { TabList } from "./tab-list";

/**
 * @see https://www.w3.org/TR/wai-aria/#tab
 */
export const Tab: Role = {
  name: "tab",
  category: Category.Widget,
  inherits: () => [SectionHead, Widget],
  context: () => [TabList],
  supported: () => [
    Attributes.PositionInSet,
    Attributes.Selected,
    Attributes.SetSize
  ],
  label: { from: ["contents", "author"] }
};
