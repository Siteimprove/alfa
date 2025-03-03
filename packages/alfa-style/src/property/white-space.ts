import { Keyword, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand.js";
import { Shorthand } from "../shorthand.js";

import Collapse from "./white-space-collapse.js";
import Mode from "./text-wrap-mode.js";
import Trim from "./white-space-trim.js";

const { doubleBar, map, mapResult, either } = Parser;

export default Longhand.fromKeywords(
  { inherits: true },
  "normal",
  "pre",
  "nowrap",
  "pre-wrap",
  "break-spaces",
  "pre-line",
);

const parser = map(
  mapResult(
    either(
      Keyword.parse("normal", "pre", "pre-wrap", "pre-line"),
      doubleBar<
        Slice<Token>,
        [
          Longhand.Parsed<typeof Collapse>,
          Longhand.Parsed<typeof Mode>,
          Longhand.Parsed<typeof Trim>,
        ],
        string
      >(
        Token.parseWhitespace,
        Collapse.parseBase,
        Mode.parseBase,
        Trim.parseBase,
      ),
    ),
    (
      value,
    ): Result<
      [
        Longhand.Parsed<typeof Collapse> | undefined,
        Longhand.Parsed<typeof Mode> | undefined,
        Longhand.Parsed<typeof Trim> | undefined,
      ],
      string
    > => {
      if (value === undefined) {
        return Err.of("Expected a valid value for `white-space`");
      }

      if (!Keyword.isKeyword(value)) {
        if (value.every((v) => v === undefined)) {
          return Err.of("Expected a valid value for `white-space`");
        }

        return Result.of(value);
      }

      switch (value.value) {
        case "normal":
          return Result.of([
            Keyword.of("collapse"),
            Keyword.of("wrap"),
            Keyword.of("none"),
          ]);

        case "pre":
          return Result.of([
            Keyword.of("preserve"),
            Keyword.of("nowrap"),
            Keyword.of("none"),
          ]);

        case "pre-wrap":
          return Result.of([
            Keyword.of("preserve"),
            Keyword.of("wrap"),
            Keyword.of("none"),
          ]);

        case "pre-line":
          return Result.of([
            Keyword.of("preserve-breaks"),
            Keyword.of("wrap"),
            Keyword.of("none"),
          ]);
      }
    },
  ),
  ([collapse, mode, trim]) =>
    [
      ["white-space-collapse", collapse ?? Keyword.of("initial")],
      ["text-wrap-mode", mode ?? Keyword.of("initial")],
      ["white-space-trim", trim ?? Keyword.of("initial")],
    ] as const,
);

export const WS = Shorthand.of(
  ["white-space-collapse", "text-wrap-mode", "white-space-trim"],
  parser,
);
