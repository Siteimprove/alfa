import * as url from "node:url";

/**
 * Loads a file as JSON, and asserts the type of the result.
 *
 * @remarks
 * The path must be with OS specific path separators, use path.join to build it.
 *
 * On Windows, import requires URL ("file:///C:\…"), not paths ("C:\…"). Linux
 * doesn't care. Hence the wrapper.
 *
 * No actual type check is done on the content, as this is not really doable.
 * The output type is simply asserted.
 *
 * @internal
 */
export async function loadJSON<T = any>(path: string): Promise<T> {
  return (
    await import(url.pathToFileURL(path).toString(), { with: { type: "json" } })
  ).default as T;
}
