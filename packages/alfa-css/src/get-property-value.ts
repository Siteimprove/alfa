import { Token, TokenType } from "./alphabet";
import * as Properties from "./properties";
import {
  CascadedStyle,
  ComputedStyle,
  PropertyName,
  SpecifiedStyle
} from "./types";

export function getCascadedPropertyValue<N extends PropertyName>(
  propertyName: N,
  tokens: Array<Token>
): CascadedStyle[N] {
  for (let i = 0, n = tokens.length; i < n; i++) {
    const token = tokens[i];

    if (token.type === TokenType.Whitespace) {
      continue;
    }

    if (token.type === TokenType.Ident) {
      switch (token.value) {
        case "initial":
        case "inherit":
          return token.value;
      }
    }

    break;
  }

  const parsed = Properties[propertyName].parse(tokens);

  if (parsed === null) {
    return undefined;
  }

  return parsed;
}

export function getSpecifiedPropertyValue<N extends PropertyName>(
  propertyName: N,
  cascadedStyle: CascadedStyle,
  specifiedStyle: SpecifiedStyle,
  parentStyle: ComputedStyle
): SpecifiedStyle[N] {
  if (propertyName in specifiedStyle) {
    return specifiedStyle[propertyName];
  }

  if (propertyName in cascadedStyle) {
    const cascadedValue = cascadedStyle[propertyName];

    if (cascadedValue !== "initial" && cascadedValue !== "inherit") {
      return cascadedValue as SpecifiedStyle[N];
    }

    if (cascadedValue === "inherit" && propertyName in parentStyle) {
      return parentStyle[propertyName];
    }
  }

  const property = Properties[propertyName];

  if (property.inherits === true && propertyName in parentStyle) {
    return parentStyle[propertyName];
  }

  return property.initial();
}

export function getComputedPropertyValue<N extends PropertyName>(
  propertyName: N,
  specifiedStyle: SpecifiedStyle,
  computedStyle: ComputedStyle,
  parentStyle: ComputedStyle
): ComputedStyle[N] {
  if (propertyName in computedStyle) {
    return computedStyle[propertyName];
  }

  const property = Properties[propertyName];

  return property.computed(
    otherPropertyName => {
      if (otherPropertyName in computedStyle) {
        return computedStyle[otherPropertyName];
      }

      if (propertyName === (otherPropertyName as PropertyName)) {
        return specifiedStyle[otherPropertyName];
      }

      return getComputedPropertyValue(
        otherPropertyName,
        specifiedStyle,
        computedStyle,
        parentStyle
      );
    },
    otherPropertyName => {
      return parentStyle[otherPropertyName];
    }
  );
}
