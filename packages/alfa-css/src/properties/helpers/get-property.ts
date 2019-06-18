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
  return getCascadedPropertyValue(style, propertyName) as CascadedPropertyValue<
    N
  >;
}

function getCascadedPropertyValue(
  style: Style | null,
  propertyName: keyof Longhands
): CascadedPropertyValue | null {
  if (style === null) {
    return null;
  }

  const { cascaded } = style;
  const value = cascaded[propertyName];

  if (value === undefined) {
    return null;
  }

  return value;
}

export function getSpecifiedProperty<N extends keyof Longhands>(
  style: Style | null,
  propertyName: N
): SpecifiedPropertyValue<N> {
  return getSpecifiedPropertyValue(
    style,
    propertyName
  ) as SpecifiedPropertyValue<N>;
}

function getSpecifiedPropertyValue(
  style: Style | null,
  propertyName: keyof Longhands
): SpecifiedPropertyValue {
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

  return value;
}

export function getComputedProperty<N extends keyof Longhands>(
  style: Style | null,
  propertyName: N
): ComputedPropertyValue<N> {
  return getComputedPropertyValue(style, propertyName) as ComputedPropertyValue<
    N
  >;
}

function getComputedPropertyValue(
  style: Style | null,
  propertyName: keyof Longhands
): ComputedPropertyValue {
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

  return value;
}
