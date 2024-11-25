/**
 * @public
 */
export type String = globalThis.String;

/**
 * @public
 */
export namespace String {
  export type Transformer = (input: string) => string;

  export function and(...transformers: Array<Transformer>): Transformer {
    return (input) =>
      transformers.reduce((input, transformer) => transformer(input), input);
  }

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
   * Removes all punctuation (underscore, hyphen, brackets, quotation marks, etc)
   *
   * @remarks
   * This removes the Unicode classes P (punctuation), S (symbols),
   * and Cf (formatting characters).
   */
  export function removePunctuation(input: string): string {
    return input.replace(/\p{P}|\p{S}|\p{Cf}/gu, "");
  }

  export function toLowerCase<T extends string = string>(
    input: T,
  ): Lowercase<T> {
    return input.toLowerCase() as Lowercase<T>;
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

  /**
   * Checks whether the string contains soft break points
   * {@link https://drafts.csswg.org/css-text/#line-breaking}
   *
   * @remarks
   * Spaces are always soft break points. Other are hard to correctly detect.
   * We do not want here to have a full break point detection which, based on
   * language, requires lexical analysis.
   * We accept punctuation as soft break points since they would act so in most
   * Western languages.
   */
  export function hasSoftWrapOpportunity(input: string): boolean {
    return /\s|\p{P}/u.test(input);
  }
}
