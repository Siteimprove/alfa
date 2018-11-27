import {
  CascadedPropertyValue,
  ComputedPropertyValue,
  SpecifiedPropertyValue
} from "../../properties";
import * as Longhands from "../../properties/longhands";
import { Style } from "../../style";

type Longhands = typeof Longhands;

export function getCascadedProperty<N extends keyof Longhands>(
  style: Style | null,
  propertyName: N
): CascadedPropertyValue<N> | null {
  if (style === null) {
    return null;
  }

  const { cascaded } = style;
  const value = cascaded[propertyName];

  if (value === undefined) {
    return null;
  }

  return value as CascadedPropertyValue<N>;
}

export function getSpecifiedProperty<N extends keyof Longhands>(
  style: Style | null,
  propertyName: N
): SpecifiedPropertyValue<N> {
  const property = Longhands[propertyName];

  if (style === null) {
    return property.initial();
  }

  const { specified } = style;
  const value = specified[propertyName];

  if (value === undefined) {
    if (style.parent !== null) {
      return getComputedProperty(style.parent, propertyName);
    }

    return property.initial();
  }

  return value as SpecifiedPropertyValue<N>;
}

export function getComputedProperty<N extends keyof Longhands>(
  style: Style | null,
  propertyName: N
): ComputedPropertyValue<N> {
  const property = Longhands[propertyName];

  if (style === null) {
    return property.initial();
  }

  const { computed } = style;
  const value = computed[propertyName];

  if (value === undefined) {
    if (style.parent !== null) {
      return getComputedProperty(style.parent, propertyName);
    }

    return property.initial();
  }

  return value as ComputedPropertyValue<N>;
}
