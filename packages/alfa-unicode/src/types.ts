/**
 * @see https://www.unicode.org/versions/Unicode11.0.0/ch04.pdf#G134153
 */
export enum Category {
  Lu = 1 << 0, // Uppercase
  Ll = 1 << 1, // Lowercase
  Lt = 1 << 2, // Titlecase
  Lm = 1 << 3, // Modifier
  Lo = 1 << 4, // Other
  Letter = Category.Lu | Category.Ll | Category.Lt | Category.Lm | Category.Lo,

  Mn = 1 << 5, // Non-spacing
  Mc = 1 << 6, // Combining
  Me = 1 << 7, // Enclosing
  Mark = Category.Mn | Category.Mc | Category.Me,

  Nd = 1 << 8, // Decimal
  Nl = 1 << 9, // Letter
  No = 1 << 10, // Other
  Number = Category.Nd | Category.Nl | Category.No,

  Pc = 1 << 11, // Connector
  Pd = 1 << 12, // Dash
  Ps = 1 << 13, // Open
  Pe = 1 << 14, // Close
  Pi = 1 << 15, // Initial quote
  Pf = 1 << 16, // Final quote
  Po = 1 << 17, // Other
  Punctuation = Category.Pc |
    Category.Pd |
    Category.Ps |
    Category.Pe |
    Category.Pi |
    Category.Pf |
    Category.Po,

  Sm = 1 << 18, // Math
  Sc = 1 << 19, // Currency
  Sk = 1 << 20, // Modifier
  So = 1 << 21, // Other
  Symbol = Category.Sm | Category.Sc | Category.Sk | Category.So,

  Zs = 1 << 22, // Sapce
  Zl = 1 << 23, // Line
  Zp = 1 << 24, // Paragraph
  Separator = Category.Zs | Category.Zl | Category.Zp,

  Cc = 1 << 25, // Control
  Cf = 1 << 26, // Format
  Cs = 1 << 27, // Surrogate
  Co = 1 << 28, // Private use
  Cn = 1 << 29, // Not assigned
  Other = Category.Cc | Category.Cf | Category.Cs | Category.Co | Category.Cn
}

export interface Character {
  readonly name: string;
  readonly code: number | [number, number];
  readonly category: Category;
}
