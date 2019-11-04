import {
  CascadedPropertyValue,
  CascadedStyle,
  ComputedPropertyValue,
  ComputedStyle,
  PropertyName,
  SpecifiedPropertyValue,
  SpecifiedStyle
} from "@siteimprove/alfa-css";
import { None, Option, Some } from "@siteimprove/alfa-option";

export function getPropertyValue<S, N extends PropertyName>(
  style: ComputedStyle<S>,
  propertyName: N
): Option<ComputedPropertyValue<N>>;

export function getPropertyValue<S, N extends PropertyName>(
  style: SpecifiedStyle<S>,
  propertyName: N
): Option<SpecifiedPropertyValue<N>>;

export function getPropertyValue<S, N extends PropertyName>(
  style: CascadedStyle<S>,
  propertyName: N
): Option<CascadedPropertyValue<N>>;

export function getPropertyValue<S>(
  style: CascadedStyle<S> | SpecifiedStyle<S> | ComputedStyle<S>,
  propertyName: PropertyName
): Option<
  CascadedPropertyValue | SpecifiedPropertyValue | ComputedPropertyValue
> {
  const property = style[propertyName];

  if (property === undefined) {
    return None;
  }

  return Some.of(property.value);
}
