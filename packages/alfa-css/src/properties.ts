import { Property } from "./types";
import { ColorProperty } from "./property/color";
import { DisplayProperty } from "./property/display";
import { FontSizeProperty } from "./property/font";
import { VisibilityProperty } from "./property/visibility";

export * from "./property/color";
export * from "./property/display";
export * from "./property/font";
export * from "./property/visibility";

export const Properties = {
  color: ColorProperty,
  display: DisplayProperty,
  fontSize: FontSizeProperty,
  visibility: VisibilityProperty
};
