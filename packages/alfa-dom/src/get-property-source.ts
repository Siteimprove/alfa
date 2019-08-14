import {
  CascadedStyle,
  ComputedStyle,
  PropertyName,
  SpecifiedStyle
} from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-util";

export function getPropertySource<S>(
  style: CascadedStyle<S> | SpecifiedStyle<S> | ComputedStyle<S>,
  propertyName: PropertyName
): Option<S> {
  const property = style[propertyName];

  if (property === undefined) {
    return null;
  }

  return property.source;
}
