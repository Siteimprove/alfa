import { Property } from "./types";
import { ColorProperty } from "./property/color";
import { DisplayProperty } from "./property/display";
import { FontSizeProperty } from "./property/font";

export * from "./property/color";
export * from "./property/display";
export * from "./property/font";

export const Properties = {
  color: ColorProperty,
  display: DisplayProperty,
  fontSize: FontSizeProperty
};
