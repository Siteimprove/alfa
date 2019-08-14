import {
  CascadedPropertyValue,
  CascadedStyle,
  ComputedPropertyValue,
  ComputedStyle,
  PropertyName,
  SpecifiedPropertyValue,
  SpecifiedStyle
} from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-util";

export function getPropertyValue<S, N extends PropertyName>(
  style: CascadedStyle<S>,
  propertyName: N
): Option<CascadedPropertyValue<N>>;

export function getPropertyValue<S, N extends PropertyName>(
  style: SpecifiedStyle<S>,
  propertyName: N
): Option<SpecifiedPropertyValue<N>>;

export function getPropertyValue<S, N extends PropertyName>(
  style: SpecifiedStyle<S>,
  propertyName: N
): Option<ComputedPropertyValue<N>>;

export function getPropertyValue<S>(
  style: CascadedStyle<S> | SpecifiedStyle<S> | ComputedStyle<S>,
  propertyName: PropertyName
):
  | Option<CascadedPropertyValue>
  | Option<SpecifiedPropertyValue>
  | Option<ComputedPropertyValue> {
  const property = style[propertyName];

  if (property === undefined) {
    return null;
  }

  return property.value;
}
