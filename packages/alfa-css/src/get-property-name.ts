import * as Properties from "./properties";
import { PropertyName } from "./types";

export function getPropertyName(input: string): PropertyName | null {
  const propertyName = input.replace(/-([a-z])/g, match =>
    match[1].toUpperCase()
  );

  if (propertyName in Properties) {
    return propertyName as PropertyName;
  }

  return null;
}
