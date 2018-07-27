/**
 * @see https://www.unicode.org/versions/Unicode11.0.0/ch04.pdf#G134153
 */
export const enum Category {
  // Letter
  Lu,
  Ll,
  Lt,
  Lm,
  Lo,

  // Mark
  Mn,
  Mc,
  Me,

  // Number
  Nd,
  Nl,
  No,

  // Punctuation
  Pc,
  Pd,
  Ps,
  Pe,
  Pi,
  Pf,
  Po,

  // Symbol
  Sm,
  Sc,
  Sk,
  So,

  // Separator
  Zs,
  Zl,
  Zp,

  // Other
  Cc,
  Cf,
  Cs,
  Co,
  Cn
}

export interface Character {
  readonly name: string;
  readonly code: number | [number, number];
  readonly category: Category;
}
