import { Property } from "./types";
import { ColorProperty } from "./properties/color";
import { DisplayProperty } from "./properties/display";
import { FontSizeProperty } from "./properties/font";
import { VisibilityProperty } from "./properties/visibility";

export const Properties = {
  color: ColorProperty,
  display: DisplayProperty,
  fontSize: FontSizeProperty,
  visibility: VisibilityProperty
};
