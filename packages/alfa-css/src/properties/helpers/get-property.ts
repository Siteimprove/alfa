import {
  CascadedPropertyValue,
  ComputedPropertyValue,
  SpecifiedPropertyValue
} from "../../properties";
import * as Longhands from "../../properties/longhands";
import { Style, StyleValue } from "../../style";

type Longhands = typeof Longhands;

export function getCascadedProperty<S, N extends keyof Longhands>(
  style: Style<S> | null,
  propertyName: N
): StyleValue<CascadedPropertyValue<N>, S> | null {
  return getCascadedPropertyValue(style, propertyName) as StyleValue<
    CascadedPropertyValue<N>,
    S
  >;
}

function getCascadedPropertyValue<S>(
  style: Style<S> | null,
  propertyName: keyof Longhands
): StyleValue<CascadedPropertyValue, S> | null {
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

export function getSpecifiedProperty<S, N extends keyof Longhands>(
  style: Style<S> | null,
  propertyName: N
): StyleValue<SpecifiedPropertyValue<N>, S> {
  return getSpecifiedPropertyValue(style, propertyName) as StyleValue<
    SpecifiedPropertyValue<N>,
    S
  >;
}

function getSpecifiedPropertyValue<S>(
  style: Style<S> | null,
  propertyName: keyof Longhands
): StyleValue<SpecifiedPropertyValue, S> {
  const property = Longhands[propertyName];

  if (style === null) {
    return { value: property.initial(), source: null };
  }

  const { specified } = style;
  const value = specified[propertyName];

  if (value === undefined) {
    if (style.parent !== null) {
      return getComputedProperty(style.parent, propertyName);
    }

    return { value: property.initial(), source: null };
  }

  return value;
}

export function getComputedProperty<S, N extends keyof Longhands>(
  style: Style<S> | null,
  propertyName: N
): StyleValue<ComputedPropertyValue<N>, S> {
  return getComputedPropertyValue(style, propertyName) as StyleValue<
    ComputedPropertyValue<N>,
    S
  >;
}

function getComputedPropertyValue<S>(
  style: Style<S> | null,
  propertyName: keyof Longhands
): StyleValue<ComputedPropertyValue, S> {
  const property = Longhands[propertyName];

  if (style === null) {
    return { value: property.initial(), source: null };
  }

  const { computed } = style;
  const value = computed[propertyName];

  if (value === undefined) {
    if (style.parent !== null) {
      return getComputedProperty(style.parent, propertyName);
    }

    return { value: property.initial(), source: null };
  }

  return value;
}
