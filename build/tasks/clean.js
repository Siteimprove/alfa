import { findFiles, removeFile } from "../helpers/file-system";
import { endsWith } from "../helpers/predicates";

/**
 * @param {string} directory
 */
export function clean(directory) {
  const shouldClean = endsWith(".js", ".d.ts", ".map");

  const files = findFiles(
    [`${directory}/src`, `${directory}/test`],
    shouldClean,
    {
      gitIgnore: false
    }
  );

  for (const file of files) {
    removeFile(file);
  }
}
