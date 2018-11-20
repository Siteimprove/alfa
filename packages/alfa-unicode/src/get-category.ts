import { Characters } from "./characters.js";
import { Category } from "./types";

const { isArray } = Array;

// Allocate a byte array with enough slots for the entire valid Unicode range.
// Each slot represents a Unicode code point and its value the category of the
// code point.
const categories = new Uint8Array(0x110000);

for (let i = 0, n = Characters.length; i < n; i++) {
  const { code, category } = Characters[i];

  if (isArray(code)) {
    const [start, end] = code;

    for (let i = start, n = end; i <= n; i++) {
      categories[i] = category;
    }
  } else {
    categories[code] = category;
  }
}

/**
 * Get the category of a character code. If the character code is outside the
 * valid Unicode range, `null` is returned.
 */
export function getCategory(char: number): Category | null {
  if (char < 0 || char > 0x10ffff) {
    return null;
  }

  return categories[char];
}
