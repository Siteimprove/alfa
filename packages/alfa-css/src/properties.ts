import { Property } from "./types";
import { ColorProperty } from "./properties/color";
import { DisplayProperty } from "./properties/display";
import { FontSizeProperty } from "./properties/font";
import { VisibilityProperty } from "./properties/visibility";
import { OpacityProperty } from "./properties/opacity";

export const Properties = {
  color: ColorProperty,
  display: DisplayProperty,
  fontSize: FontSizeProperty,
  visibility: VisibilityProperty,
  opacity: OpacityProperty
};
