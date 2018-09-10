import * as Longhands from "./properties/longhands";
import * as Shorthands from "./properties/shorthands";

export function getPropertyName(
  input: string
): keyof typeof Longhands | keyof typeof Shorthands | null {
  const propertyName = input.replace(/-([a-z])/g, match =>
    match[1].toUpperCase()
  );

  if (propertyName in Longhands) {
    return propertyName as keyof typeof Longhands;
  }

  if (propertyName in Shorthands) {
    return propertyName as keyof typeof Shorthands;
  }

  return null;
}
