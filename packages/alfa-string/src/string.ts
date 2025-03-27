import type { Callback } from "@siteimprove/alfa-callback";
import type { Predicate } from "@siteimprove/alfa-predicate";

/**
 * @public
 */
export type String = globalThis.String;

/**
 * @public
 */
export namespace String {
  export type Transformer<S extends string = string> = Callback<string, S>;

  export namespace Transformer {
    /**
     * Transform a string if it matches a predicate
     */
    export function when(
      predicate: Predicate<string>,
      transformer: Transformer,
    ): Transformer {
      return (input) => (predicate(input) ? transformer(input) : input);
    }

    /**
     * Chains transformers on a string.
     */
    export function and(...transformers: Array<Transformer>): Transformer {
      return (input) =>
        transformers.reduce((input, transformer) => transformer(input), input);
    }
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
   * Trims, collapses adjacent whitespace into a single ASCII space, optionally
   * lowercases (default: true).
   */
  export function normalize(
    input: string,
    toLowerCase: boolean = true,
  ): string {
    return flatten(toLowerCase ? input.toLowerCase() : input).trim();
  }

  /**
   * Removes all punctuation (underscore, hyphen, brackets, quotation marks,
   * etc)
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
   * Checks whether the input contains only whitespace, optionally allowing
   * empty strings (default: true).
   */
  export function isWhitespace(
    input: string,
    allowEmpty: boolean = true,
  ): boolean {
    return (allowEmpty || input.length > 0) && input.trim() === "";
  }

  /**
   * Fallback to a default value if the input is empty or whitespace
   */
  export function fallback(fallback: string): Transformer {
    return Transformer.when(isWhitespace, () => fallback);
  }

  /**
   * Checks whether the input contains a whitespace
   */
  export function hasWhitespace(input: string): boolean {
    return /\s/.test(input);
  }

  /**
   * Checks whether the string contains soft wrap opportunities
   * {@link https://drafts.csswg.org/css-text-4/#line-breaking}
   *
   * @remarks
   * Spaces are always soft break points. Other are hard to correctly detect.
   * We do not want here to have a full break point detection which, based on
   * language, requires lexical analysis.
   * We accept visible hyphens (U+002D - HYPHEN-MINUS and U+2010 ‐ HYPHEN) that
   * are explicitly called out in CSS hyphens definition.
   * {@link https://drafts.csswg.org/css-text-4/#hyphens-property}
   *
   * @privateRemarks
   * \\s, or \\p\{White_Space\} contains non-breaking spaces which we want to exclude.
   * In ES2024, we could use the /v flag to do set subtraction. As long as we
   * target ES2022, we need to do that manually.
   * \\s is equivalent to
   * [\\f\\n\\r\\t\\v\\u0020\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff]
   * from here we remove U+00A0 NO-BREAK SPACE, U+202F NARROW NO-BREAK SPACE,
   * and U+FEFF ZERO WIDTH NO-BREAK SPACE.
   *
   * We then add U+200B ZERO WIDTH SPACE.
   *
   * We may be missing some other characters that are soft wrap opportunities.
   * These are likely rare occurrences in actual texts, and we'll add them as
   * needed.
   *
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Character_classes#types}
   * {@link https://www.fileformat.info/info/unicode/char/00A0/index.htm}
   * {@link https://www.fileformat.info/info/unicode/char/202F/index.htm}
   * {@link https://www.fileformat.info/info/unicode/char/FEFF/index.htm}
   * {@link https://www.fileformat.info/info/unicode/char/200b/index.htm}
   */
  export function hasSoftWrapOpportunity(input: string): boolean {
    // TODO: update to use /[\\p{White_Space}--\u00a0\u202f\ufeff]/v when
    // TODO: switching to ES2024
    // The first dash is a character range. The last two are a \ protected
    // U+2010 ‐ HYPHEN (to prevent interpretation as range), and a U+002D - HYPHEN-MINUS
    return /[\f\n\r\t\v\u0020\u1680\u2000-\u200a\u2028\u2029\u205f\u3000\-‐\u200b]/.test(
      input,
    );
  }

  /**
   * Checks whether the string contains hyphenation opportunities
   * {@link https://drafts.csswg.org/css-text-4/#hyphenation-opportunity}
   *
   * @remarks
   * Hyphenation opportunities are places where automatic hyphenation can happen
   * without it to be visible if it does not happen. Hyphenation opportunities
   * are only soft wrap opportunities when hyphenation is allowed.
   *
   * The soft hyphen character (U+00AD SOFT HYPHEN (HTML \&shy;)) is a
   * hyphenation opportunity. Always visible hyphens (e.g. U+2010 ‐ HYPHEN) are
   * not because they are always soft wrap opportunities.
   */
  export function hasHyphenationOpportunity(input: string): boolean {
    return /\u00AD/.test(input);
  }
}
