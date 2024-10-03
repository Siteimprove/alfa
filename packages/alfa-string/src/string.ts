/**
 * @public
 */
export type String = globalThis.String;

/**
 * @public
 */
export namespace String {
  /**
   * Adds two spaces at the start of each line.
   */
  export function indent(input: string): string {
    return input.replace(/^/gm, "  ");
  }

  /**
   * Collapses adjacent whitespace into a single ASCII space
   */
  export function flatten(input: string): string {
    return input.replace(/\s+/g, " ");
  }

  /**
   * Trims, collapses adjacent whitespace into a single ASCII space, optionally lowercases (default: true).
   */
  export function normalize(
    input: string,
    toLowerCase: boolean = true,
  ): string {
    return flatten(toLowerCase ? input.toLowerCase() : input).trim();
  }

  /**
   * Checks whether the input contains only whitespace
   */
  export function isWhitespace(
    input: string,
    allowEmpty: boolean = true,
  ): boolean {
    return (allowEmpty || input.length > 0) && input.trim() === "";
  }

  /**
   * Checks whether the input contains a whitespace
   */
  export function hasWhitespace(input: string): boolean {
    return /\s/.test(input);
  }
}
