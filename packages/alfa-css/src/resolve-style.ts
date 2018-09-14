import { concat, keys, Mutable } from "@siteimprove/alfa-util";
import { TokenType } from "./alphabet";
import {
  CascadedPropertyValues,
  ComputedPropertyValues,
  SpecifiedPropertyValues
} from "./properties";
import * as Longhands from "./properties/longhands";
import * as Shorthands from "./properties/shorthands";
import { Declaration } from "./types";
import { Values } from "./values";

type Longhands = typeof Longhands;
type Shorthands = typeof Shorthands;

export type CascadedStyle = {
  readonly [N in keyof Longhands]?: CascadedPropertyValues[N]
};

export type SpecifiedStyle = {
  readonly [N in keyof Longhands]?: SpecifiedPropertyValues[N]
};

export type ComputedStyle = {
  readonly [N in keyof Longhands]?: ComputedPropertyValues[N]
};

export function resolveCascadedStyle(
  declarations: ReadonlyArray<Declaration>
): CascadedStyle {
  const cascadedStyle: Mutable<CascadedStyle> = {};

  const setProperty: <N extends keyof Longhands>(
    propertyName: N,
    propertyValue: CascadedPropertyValues[N],
    important: boolean
  ) => void = (propertyName, propertyValue, important) => {
    // If the property name is already present in the cascaded style then this
    // means that the property was set inline and that we're now trying to set
    // it from the cascaded styles. However, only important declarations from
    // the cascaded styles can override those set inline so we move on if the
    // declaration is not important.
    if (propertyName in cascadedStyle === false || important) {
      cascadedStyle[propertyName] = propertyValue;
    }
  };

  outer: for (const { name, value, important } of declarations) {
    const propertyName = getPropertyName(name);

    if (propertyName === null) {
      continue;
    }

    for (let i = 0, n = value.length; i < n; i++) {
      const token = value[i];

      if (token.type === TokenType.Whitespace) {
        continue;
      }

      if (token.type === TokenType.Ident) {
        switch (token.value) {
          case "initial":
          case "inherit":
            const value = Values.keyword(token.value);

            if (isLonghandPropertyName(propertyName)) {
              setProperty(propertyName, value, important);
            } else {
              const { longhands } = Shorthands[propertyName];

              for (const propertyName of longhands) {
                setProperty(propertyName, value, important);
              }
            }

            continue outer;
        }
      }

      break;
    }

    if (isLonghandPropertyName(propertyName)) {
      const property = Longhands[propertyName];

      const result = property.parse(value);

      if (result !== null) {
        setProperty(propertyName, result, important);
      }
    } else {
      const property = Shorthands[propertyName];

      const result = property.parse(value);

      if (result !== null) {
        for (const propertyName of keys(result)) {
          const value = result[propertyName];

          if (value !== undefined) {
            setProperty(propertyName, value, important);
          }
        }
      }
    }
  }

  return cascadedStyle;
}

export function resolveSpecifiedStyle(
  cascadedStyle: CascadedStyle,
  parentStyle: ComputedStyle
): SpecifiedStyle {
  const specifiedStyle: Mutable<SpecifiedStyle> = {};

  const propertyNames = new Set([...keys(cascadedStyle), ...keys(parentStyle)]);

  for (const propertyName of propertyNames) {
    const property = Longhands[propertyName];

    if (propertyName in cascadedStyle) {
      const cascadedValue = cascadedStyle[propertyName]!;

      if (Values.isKeyword(cascadedValue, "initial", "inherit")) {
        if (
          Values.isKeyword(cascadedValue, "inherit") &&
          propertyName in parentStyle
        ) {
          specifiedStyle[propertyName] = parentStyle[propertyName]!;
        } else {
          specifiedStyle[propertyName] = property.initial();
        }
      } else {
        specifiedStyle[propertyName] = cascadedValue;
      }

      continue;
    }

    if (property.inherits === true && propertyName in parentStyle) {
      specifiedStyle[propertyName] = parentStyle[propertyName]!;
    } else {
      specifiedStyle[propertyName] = property.initial();
    }
  }

  return specifiedStyle;
}

export function resolveComputedStyle(
  specifiedStyle: SpecifiedStyle,
  parentStyle: ComputedStyle
): ComputedStyle {
  const computedStyle: Mutable<ComputedStyle> = {};

  const getProperty: <N extends keyof Longhands>(
    propertyName: N
  ) => ComputedPropertyValues[N] = propertyName => {
    if (propertyName in computedStyle) {
      return computedStyle[propertyName]!;
    }

    const property = Longhands[propertyName];

    return property.computed(
      propertyName => {
        if (property === Longhands[propertyName]) {
          if (propertyName in specifiedStyle) {
            return specifiedStyle[propertyName]!;
          }

          return property.initial();
        }

        return getProperty(propertyName);
      },
      propertyName => {
        if (propertyName in parentStyle) {
          return parentStyle[propertyName]!;
        }

        const property = Longhands[propertyName];

        return property.computed(
          propertyName => {
            if (propertyName in parentStyle) {
              return parentStyle[propertyName]!;
            }

            const property = Longhands[propertyName];

            return property.initial();
          },
          propertyName => {
            throw new Error("I cannot let you do that");
          }
        );
      }
    );
  };

  for (const propertyName of keys(specifiedStyle)) {
    computedStyle[propertyName] = getProperty(propertyName);
  }

  return computedStyle;
}

const propertyNames = new Map<string, keyof Longhands | keyof Shorthands>();

for (const propertyName of concat(keys(Longhands), keys(Shorthands))) {
  propertyNames.set(
    propertyName.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`),
    propertyName
  );
}

function getPropertyName(
  input: string
): keyof Longhands | keyof Shorthands | null {
  const propertyName = propertyNames.get(input);

  if (propertyName === undefined) {
    return null;
  }

  return propertyName;
}

function isLonghandPropertyName(
  propertyName: keyof Longhands | keyof Shorthands
): propertyName is keyof Longhands {
  return propertyName in Longhands;
}
