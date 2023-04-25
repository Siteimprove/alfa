import { Keyword, Token } from "@siteimprove/alfa-css";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Result } from "@siteimprove/alfa-result";
import * as slice from "@siteimprove/alfa-slice";

import * as Outset from "./border-image-outset";
import * as Repeat from "./border-image-repeat";
import * as Source from "./border-image-source";
import * as Slice from "./border-image-slice";
import * as Width from "./border-image-width";

const { delimited, either, map, option, pair, right } = Parser;

const parseSlash = delimited(
  option(Token.parseWhitespace),
  Token.parseDelim("/")
);

/**
 * Parsing
 * [ / <'width'> | / <'width'>? / <'outset'> ]?
 */
const parseWidthOutset: Parser<
  slice.Slice<Token>,
  [Option<Width.Specified>, Option<Outset.Specified>],
  string
> = map<
  slice.Slice<Token>,
  Option<[Option<Width.Specified>, Option<Outset.Specified>]>,
  [Option<Width.Specified>, Option<Outset.Specified>],
  string
>(
  option(
    right(
      parseSlash,
      // we need the longest first so it can fail and default to shortest
      either(
        map(
          pair(option(Width.parse), right(parseSlash, Outset.parse)),
          ([width, outset]) => [width, Option.of(outset)]
        ),
        map(Width.parse, (width) => [Option.of(width), None])
      )
    )
  ),
  (result) => result.getOr([None, None])
);

const parse: Parser<
  slice.Slice<Token>,
  [
    Source.Specified | Keyword<"initial">,
    Slice.Specified | Keyword<"initial">,
    Width.Specified | Keyword<"initial">,
    Outset.Specified | Keyword<"initial">,
    Repeat.Specified | Keyword<"initial">
  ],
  string
> = (input) => {
  let source: Source.Specified | undefined;
  let slice: Slice.Specified | undefined;
  let width: Option<Width.Specified> = None;
  let outset: Option<Outset.Specified> = None;
  let repeat: Repeat.Specified | undefined;

  while (true) {
    for (const [remainder] of Token.parseWhitespace(input)) {
      input = remainder;
    }

    // <source>
    if (source === undefined) {
      const result = Source.parse(input);

      if (result.isOk()) {
        [input, source] = result.get();
        continue;
      }
    }

    // <slice> [ / <'width'> | / <'width'>? / <'outset'> ]?
    if (slice === undefined) {
      const result = pair(Slice.parse, parseWidthOutset)(input);

      if (result.isOk()) {
        [input, [slice, [width, outset]]] = result.get();
        continue;
      }
    }

    // <repeat>
    if (repeat === undefined) {
      const result = Repeat.parse(input);

      if (result.isOk()) {
        [input, repeat] = result.get();
        continue;
      }
    }

    break;
  }

  return Result.of([
    input,
    [
      source ?? Keyword.of("initial"),
      slice ?? Keyword.of("initial"),
      width.getOr(Keyword.of("initial")),
      outset.getOr(Keyword.of("initial")),
      repeat ?? Keyword.of("initial"),
    ],
  ]);
};

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-image}
 * @internal
 */
export default Property.shorthand(
    [
      "border-image-source",
      "border-image-slice",
      "border-image-width",
      "border-image-outset",
      "border-image-repeat",
    ],
    map(parse, ([source, slice, width, outset, repeat]) => [
      ["border-image-source", source],
      ["border-image-slice", slice],
      ["border-image-width", width],
      ["border-image-outset", outset],
      ["border-image-repeat", repeat],
    ])
);
