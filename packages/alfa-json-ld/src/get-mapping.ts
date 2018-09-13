import { isDictionary } from "./guards";
import { Context, Keyword } from "./types";

/**
 * @internal
 */
export function getMapping(
  context: Context,
  property: string | null,
  term: Keyword
): string | boolean | null {
  if (property === null) {
    return null;
  }

  const definition = context[property];

  if (
    definition === null ||
    definition === undefined ||
    !isDictionary(definition)
  ) {
    return null;
  }

  const mapping = definition[term];

  if (typeof mapping !== "string" && typeof mapping !== "boolean") {
    return null;
  }

  return mapping;
}
