import { Token, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Shorthand } from "../foo-shorthand-class";
import { Tuple } from "./value/tuple";

const { delimited, either, map, option, pair, right, takeBetween } = Parser;

/**
 * @internal
 **/
const parse = map(
  pair(
    takeBetween(
      delimited(
        option(Token.parseWhitespace),
        either(Length.parse, Percentage.parse)
      ),
      1,
      4
    ),
    option(
      right(
        Token.parseDelim("/"),
        takeBetween(
          delimited(
            option(Token.parseWhitespace),
            either(Length.parse, Percentage.parse)
          ),
          1,
          4
        )
      )
    )
  ),
  ([horizontal, vertical]) => {
    const [tlh, trh = tlh, brh = tlh, blh = trh] = horizontal;
    let tlv, trv, brv, blv;

    if (vertical.isSome()) {
      const v = vertical.get();
      tlv = v[0];
      trv = v?.[1] ?? tlv;
      brv = v?.[2] ?? tlv;
      blv = v?.[3] ?? trv;
    } else {
      [tlv, trv, brv, blv] = [tlh, trh, brh, blh];
    }

    return [
      Tuple.of(tlh, tlv),
      Tuple.of(trh, trv),
      Tuple.of(brh, brv),
      Tuple.of(blh, blv),
    ] as const;
  }
);

export default Shorthand.of(
  [
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-right-radius",
    "border-bottom-left-radius",
  ],
  map(parse, ([topLeft, topRight, bottomRight, bottomLeft]) => [
    ["border-top-left-radius", topLeft],
    ["border-top-right-radius", topRight],
    ["border-bottom-right-radius", bottomRight],
    ["border-bottom-left-radius", bottomLeft],
  ])
);
