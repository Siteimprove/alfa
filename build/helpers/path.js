import * as path from "path";

/**
 * @param {string} file
 * @param {string} extension
 * @return {string}
 */
export function withExtension(file, extension) {
  return path.join(
    path.dirname(file),
    path.basename(file, path.extname(file)) + extension
  );
}
