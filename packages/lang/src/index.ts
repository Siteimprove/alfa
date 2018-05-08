// Expose string utilities to consumers of @alfa/lang as a convenience. Packages
// that implement lexers will most likely need one or more of these and getting
// them within the same import is neat.
export {
  isAlpha,
  isAlphanumeric,
  isAscii,
  isBetween,
  isHex,
  isNewline,
  isNumeric,
  isWhitespace
} from "@alfa/util";

export * from "./alphabet";
export * from "./grammar";
export * from "./lex";
export * from "./parse";
export * from "./stream";
export * from "./types";
