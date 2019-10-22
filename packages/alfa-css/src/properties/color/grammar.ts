import * as Lang from "@siteimprove/alfa-lang";
import { getNumericValue, Grammar, skip } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Values } from "../../values";
import { FunctionArguments } from "../helpers/function-arguments";
import { NamedColors } from "./named";
import { Color } from "./types";

const { min } = Math;

function rgbColor(args: FunctionArguments): Color.RGB | null {
  const red = args.number() || args.percentage();

  if (red === false) {
    return null;
  }

  const green = args.number() || args.percentage();

  if (green === false) {
    return null;
  }

  const blue = args.number() || args.percentage();

  if (blue === false) {
    return null;
  }

  return Values.func("rgb", [red, green, blue]);
}

function rgbaColor(args: FunctionArguments): Color.RGB | null {
  const color = rgbColor(args);

  if (color === null) {
    return null;
  }

  const alpha = args.number() || args.percentage();

  if (alpha === false) {
    return null;
  }

  color.value.args[3] = alpha;

  return color;
}

function hslColor(args: FunctionArguments): Color.HSL | null {
  const hue = args.number() || args.angle();

  if (hue === false) {
    return null;
  }

  const saturation = args.percentage();

  if (saturation === false) {
    return null;
  }

  const lightness = args.percentage();

  if (lightness === false) {
    return null;
  }

  return Values.func("hsl", [hue, saturation, lightness]);
}

function hslaColor(args: FunctionArguments): Color | null {
  const color = hslColor(args);

  if (color === null) {
    return null;
  }

  const alpha = args.number();

  if (alpha === false) {
    return null;
  }

  color.value.args[3] = alpha;

  return color;
}

/**
 * @see https://www.w3.org/TR/css-color/#typedef-hex-color
 */
function hexColor(token: Tokens.Hash): Color | null {
  const { value } = token;
  const { length } = value;

  let shorthand = false;
  let alpha = false;

  switch (length) {
    case 3:
      shorthand = true;
      break;
    case 4:
      shorthand = true;
      alpha = true;
      break;
    case 6:
      break;
    case 8:
      alpha = true;
      break;
    default:
      return null;
  }

  let hex = 0;

  for (let i = 0, n = min(shorthand ? 4 : 8, length); i < n; i++) {
    const number = getNumericValue(value.charCodeAt(i));

    if (number === null) {
      return null;
    }

    hex = hex * 0x10 + number;

    if (shorthand) {
      hex = hex * 0x10 + number;
    }
  }

  if (!alpha) {
    hex = hex * 0x10 + 0xf;
    hex = hex * 0x10 + 0xf;
  }

  return Values.number(hex);
}

type Production<T extends Token> = Lang.Production<Token, Color, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    const { value } = token;
    if (value === "transparent") {
      return Transparent;
    }

    if (value in NamedColors) {
      return Values.string(value);
    }

    return null;
  }
};

const functionName: Production<Tokens.FunctionName> = {
  token: TokenType.FunctionName,
  prefix(token, stream) {
    const args = new FunctionArguments(stream);

    let color: Color | null;

    switch (token.value) {
      case "rgb":
        color = rgbColor(args);
        break;

      case "rgba":
        color = rgbaColor(args);
        break;

      case "hsl":
        color = hslColor(args);
        break;

      case "hsla":
        color = hslaColor(args);
        break;

      default:
        return null;
    }

    if (!args.done()) {
      return null;
    }

    return color;
  }
};

const hash: Production<Tokens.Hash> = {
  token: TokenType.Hash,
  prefix(token, stream) {
    return hexColor(token);
  }
};

export const ColorGrammar: Grammar<Token, Color> = new Grammar(
  [skip(TokenType.Whitespace), ident, hash, functionName],
  () => null
);

/**
 * @see https://www.w3.org/TR/css-color/#transparent-color
 */
export const Transparent = Values.keyword("transparent");
