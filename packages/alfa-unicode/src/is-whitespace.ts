import { getCategory } from "./get-category";
import { Category } from "./types";

/**
 * @see https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */
export function isWhitespace(code: number): boolean {
  const category = getCategory(code);

  if (category === null) {
    return false;
  }

  if ((category & Category.Separator) !== 0) {
    return true;
  }

  if (code >= 0x0009 && code <= 0x000d) {
    return true;
  }

  return code === 0x0085;
}
