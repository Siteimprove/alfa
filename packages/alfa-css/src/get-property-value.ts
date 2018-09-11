import { keys, Mutable } from "@siteimprove/alfa-util";
import { Token, TokenType } from "./alphabet";
import * as Longhands from "./properties/longhands";
import * as Shorthands from "./properties/shorthands";
import { CascadedStyle, ComputedStyle, SpecifiedStyle } from "./types";

export function getCascadedPropertyValue(
  propertyName: keyof typeof Longhands | keyof typeof Shorthands,
  tokens: Array<Token>
): CascadedStyle {
  for (let i = 0, n = tokens.length; i < n; i++) {
    const token = tokens[i];

    if (token.type === TokenType.Whitespace) {
      continue;
    }

    if (token.type === TokenType.Ident) {
      switch (token.value) {
        case "initial":
        case "inherit":
          return { [propertyName]: token.value };
      }
    }

    break;
  }

  if (propertyName in Longhands) {
    const property = Longhands[propertyName as keyof typeof Longhands];

    const result = property.parse(tokens);

    if (result !== null) {
      return { [propertyName]: result };
    }
  }

  if (propertyName in Shorthands) {
    const property = Shorthands[propertyName as keyof typeof Shorthands];

    const result = property.parse(tokens);

    if (result !== null) {
      return result;
    }
  }

  return {};
}

export function getSpecifiedPropertyValue(
  propertyName: keyof typeof Longhands,
  cascadedStyle: CascadedStyle,
  specifiedStyle: SpecifiedStyle,
  parentStyle: ComputedStyle
): SpecifiedStyle {
  if (propertyName in cascadedStyle) {
    const cascadedValue = cascadedStyle[propertyName];

    if (cascadedValue !== "initial" && cascadedValue !== "inherit") {
      return {
        [propertyName]: cascadedValue
      };
    }

    if (cascadedValue === "inherit" && propertyName in parentStyle) {
      return {
        [propertyName]: parentStyle[propertyName]
      };
    }
  }

  const property = Longhands[propertyName];

  if (property.inherits === true && propertyName in parentStyle) {
    return {
      [propertyName]: parentStyle[propertyName]
    };
  }

  return {
    [propertyName]: property.initial()
  };
}

export function getComputedPropertyValue(
  propertyName: keyof typeof Longhands,
  specifiedStyle: SpecifiedStyle,
  computedStyle: ComputedStyle,
  parentStyle: ComputedStyle
): ComputedStyle {
  const result: Mutable<ComputedStyle> = {};

  const property = Longhands[propertyName];

  const propertyValue = property.computed(
    otherPropertyName => {
      if (otherPropertyName in computedStyle) {
        return computedStyle[otherPropertyName];
      }

      if (propertyName === otherPropertyName) {
        return specifiedStyle[otherPropertyName];
      }

      const propertyValue = getComputedPropertyValue(
        otherPropertyName,
        specifiedStyle,
        computedStyle,
        parentStyle
      );

      for (const propertyName of keys(propertyValue)) {
        result[propertyName] = propertyValue[propertyName];
      }

      return result[otherPropertyName];
    },
    otherPropertyName => {
      return parentStyle[otherPropertyName];
    }
  );

  if (propertyValue !== undefined) {
    result[propertyName] = propertyValue;
  }

  return result;
}
