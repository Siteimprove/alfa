import {
  CascadedStyle,
  ComputedStyle,
  PropertyName,
  SpecifiedStyle
} from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";

export function getPropertySource<S>(
  style: CascadedStyle<S> | SpecifiedStyle<S> | ComputedStyle<S>,
  propertyName: PropertyName
): Option<S> {
  return Option.from(style[propertyName]).flatMap(property => property.source);
}
