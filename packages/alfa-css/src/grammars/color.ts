import { isFeatureSupported } from "@siteimprove/alfa-compatibility";
import * as Lang from "@siteimprove/alfa-lang";
import { getNumericValue, Grammar, Stream } from "@siteimprove/alfa-lang";
import { clamp, Mutable } from "@siteimprove/alfa-util";
import { FunctionName, Hash, Ident, Token, TokenType } from "../alphabet";
import { whitespace } from "../grammar";
import { Color } from "../properties/color";

const { min } = Math;

const enum Component {
  Red = 0,
  Green,
  Blue,
  Alpha
}

function functionArguments(stream: Stream<Token>): Array<Token> {
  const args: Array<Token> = [];

  let next = stream.peek(0);

  while (next !== null) {
    if (next.type === TokenType.Whitespace) {
      stream.advance(1);
      next = stream.peek(0);
      continue;
    }

    if (
      next.type === TokenType.Comma ||
      next.type === TokenType.RightParenthesis
    ) {
      break;
    }

    args.push(next);

    stream.advance(1);
    next = stream.peek(0);

    if (next !== null && next.type === TokenType.Comma) {
      stream.advance(1);
      next = stream.peek(0);
    }

    if (next !== null && next.type === TokenType.RightParenthesis) {
      stream.advance(1);
      break;
    }
  }

  return args;
}

function rgbaColor(stream: Stream<Token>): Color {
  const color: Mutable<Color> = { red: 0, green: 0, blue: 0, alpha: 1 };

  const args = functionArguments(stream);

  if (args.length !== 3 && args.length !== 4) {
    return Transparent;
  }

  if (args.length === 4 && !isFeatureSupported("css3-colors")) {
    return Transparent;
  }

  for (let i = 0, n = args.length; i < n; i++) {
    const component = args[i];

    if (
      component.type !== TokenType.Number &&
      component.type !== TokenType.Percentage
    ) {
      continue;
    }

    let { value } = component;

    if (i === Component.Alpha) {
      value = clamp(value, 0, 1);
    } else {
      if (component.type === TokenType.Percentage) {
        value *= 0xff;
      }

      value = clamp(value, 0, 255);
    }

    switch (i) {
      case Component.Red:
        color.red = value;
        break;
      case Component.Green:
        color.green = value;
        break;
      case Component.Blue:
        color.blue = value;
        break;
      case Component.Alpha:
        color.alpha = value;
    }
  }

  return color;
}

/**
 * @see https://www.w3.org/TR/css-color/#typedef-hex-color
 */
function hexColor(token: Hash): Color {
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
      return Transparent;
  }

  if (alpha && !isFeatureSupported("css-rrggbbaa")) {
    return Transparent;
  }

  let hex = 0;

  for (let i = 0, n = min(shorthand ? 4 : 8, length); i < n; i++) {
    const number = getNumericValue(value.charCodeAt(i));

    if (number === null) {
      return Transparent;
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

  return {
    red: (hex >> 24) & 0xff,
    green: (hex >> 16) & 0xff,
    blue: (hex >> 8) & 0xff,
    alpha: (hex & 0xff) / 0xff
  };
}

type Production<T extends Token> = Lang.Production<Token, Color, T>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  prefix(token) {
    const { value } = token;
    if (value === "transparent") {
      return Transparent;
    }

    if (value in NamedColors) {
      return NamedColors[token.value];
    }

    return null;
  }
};

const functionName: Production<FunctionName> = {
  token: TokenType.FunctionName,
  prefix(token, stream) {
    switch (token.value) {
      case "rgb":
      case "rgba":
        return rgbaColor(stream);
    }

    return null;
  }
};

const hash: Production<Hash> = {
  token: TokenType.Hash,
  prefix(token, stream) {
    return hexColor(token);
  }
};

export const ColorGrammar: Grammar<Token, Color> = new Grammar(
  [ident, hash, functionName, whitespace],
  () => null
);

/**
 * @see https://www.w3.org/TR/css-color/#transparent-color
 */
const Transparent: Color = { red: 0, green: 0, blue: 0, alpha: 0 };

/**
 * @see https://www.w3.org/TR/css-color/#named-colors
 */
const NamedColors: { [name: string]: Color } = {
  aliceblue: { red: 240, green: 248, blue: 255, alpha: 1 },
  antiquewhite: { red: 250, green: 235, blue: 215, alpha: 1 },
  aqua: { red: 0, green: 255, blue: 255, alpha: 1 },
  aquamarine: { red: 127, green: 255, blue: 212, alpha: 1 },
  azure: { red: 240, green: 255, blue: 255, alpha: 1 },
  beige: { red: 245, green: 245, blue: 220, alpha: 1 },
  bisque: { red: 255, green: 228, blue: 196, alpha: 1 },
  black: { red: 0, green: 0, blue: 0, alpha: 1 },
  blanchedalmond: { red: 255, green: 235, blue: 205, alpha: 1 },
  blue: { red: 0, green: 0, blue: 255, alpha: 1 },
  blueviolet: { red: 138, green: 43, blue: 226, alpha: 1 },
  brown: { red: 165, green: 42, blue: 42, alpha: 1 },
  burlywood: { red: 222, green: 184, blue: 135, alpha: 1 },
  cadetblue: { red: 95, green: 158, blue: 160, alpha: 1 },
  chartreuse: { red: 127, green: 255, blue: 0, alpha: 1 },
  chocolate: { red: 210, green: 105, blue: 30, alpha: 1 },
  coral: { red: 255, green: 127, blue: 80, alpha: 1 },
  cornflowerblue: { red: 100, green: 149, blue: 237, alpha: 1 },
  cornsilk: { red: 255, green: 248, blue: 220, alpha: 1 },
  crimson: { red: 220, green: 20, blue: 60, alpha: 1 },
  cyan: { red: 0, green: 255, blue: 255, alpha: 1 },
  darkblue: { red: 0, green: 0, blue: 139, alpha: 1 },
  darkcyan: { red: 0, green: 139, blue: 139, alpha: 1 },
  darkgoldenrod: { red: 184, green: 134, blue: 11, alpha: 1 },
  darkgray: { red: 169, green: 169, blue: 169, alpha: 1 },
  darkgreen: { red: 0, green: 100, blue: 0, alpha: 1 },
  darkgrey: { red: 169, green: 169, blue: 169, alpha: 1 },
  darkkhaki: { red: 189, green: 183, blue: 107, alpha: 1 },
  darkmagenta: { red: 139, green: 0, blue: 139, alpha: 1 },
  darkolivegreen: { red: 85, green: 107, blue: 47, alpha: 1 },
  darkorange: { red: 255, green: 140, blue: 0, alpha: 1 },
  darkorchid: { red: 153, green: 50, blue: 204, alpha: 1 },
  darkred: { red: 139, green: 0, blue: 0, alpha: 1 },
  darksalmon: { red: 233, green: 150, blue: 122, alpha: 1 },
  darkseagreen: { red: 143, green: 188, blue: 143, alpha: 1 },
  darkslateblue: { red: 72, green: 61, blue: 139, alpha: 1 },
  darkslategray: { red: 47, green: 79, blue: 79, alpha: 1 },
  darkslategrey: { red: 47, green: 79, blue: 79, alpha: 1 },
  darkturquoise: { red: 0, green: 206, blue: 209, alpha: 1 },
  darkviolet: { red: 148, green: 0, blue: 211, alpha: 1 },
  deeppink: { red: 255, green: 20, blue: 147, alpha: 1 },
  deepskyblue: { red: 0, green: 191, blue: 255, alpha: 1 },
  dimgray: { red: 105, green: 105, blue: 105, alpha: 1 },
  dimgrey: { red: 105, green: 105, blue: 105, alpha: 1 },
  dodgerblue: { red: 30, green: 144, blue: 255, alpha: 1 },
  firebrick: { red: 178, green: 34, blue: 34, alpha: 1 },
  floralwhite: { red: 255, green: 250, blue: 240, alpha: 1 },
  forestgreen: { red: 34, green: 139, blue: 34, alpha: 1 },
  fuchsia: { red: 255, green: 0, blue: 255, alpha: 1 },
  gainsboro: { red: 220, green: 220, blue: 220, alpha: 1 },
  ghostwhite: { red: 248, green: 248, blue: 255, alpha: 1 },
  gold: { red: 255, green: 215, blue: 0, alpha: 1 },
  goldenrod: { red: 218, green: 165, blue: 32, alpha: 1 },
  gray: { red: 128, green: 128, blue: 128, alpha: 1 },
  green: { red: 0, green: 128, blue: 0, alpha: 1 },
  greenyellow: { red: 173, green: 255, blue: 47, alpha: 1 },
  grey: { red: 128, green: 128, blue: 128, alpha: 1 },
  honeydew: { red: 240, green: 255, blue: 240, alpha: 1 },
  hotpink: { red: 255, green: 105, blue: 180, alpha: 1 },
  indianred: { red: 205, green: 92, blue: 92, alpha: 1 },
  indigo: { red: 75, green: 0, blue: 130, alpha: 1 },
  ivory: { red: 255, green: 255, blue: 240, alpha: 1 },
  khaki: { red: 240, green: 230, blue: 140, alpha: 1 },
  lavender: { red: 230, green: 230, blue: 250, alpha: 1 },
  lavenderblush: { red: 255, green: 240, blue: 245, alpha: 1 },
  lawngreen: { red: 124, green: 252, blue: 0, alpha: 1 },
  lemonchiffon: { red: 255, green: 250, blue: 205, alpha: 1 },
  lightblue: { red: 173, green: 216, blue: 230, alpha: 1 },
  lightcoral: { red: 240, green: 128, blue: 128, alpha: 1 },
  lightcyan: { red: 224, green: 255, blue: 255, alpha: 1 },
  lightgoldenrodyellow: { red: 250, green: 250, blue: 210, alpha: 1 },
  lightgray: { red: 211, green: 211, blue: 211, alpha: 1 },
  lightgreen: { red: 144, green: 238, blue: 144, alpha: 1 },
  lightgrey: { red: 211, green: 211, blue: 211, alpha: 1 },
  lightpink: { red: 255, green: 182, blue: 193, alpha: 1 },
  lightsalmon: { red: 255, green: 160, blue: 122, alpha: 1 },
  lightseagreen: { red: 32, green: 178, blue: 170, alpha: 1 },
  lightskyblue: { red: 135, green: 206, blue: 250, alpha: 1 },
  lightslategray: { red: 119, green: 136, blue: 153, alpha: 1 },
  lightslategrey: { red: 119, green: 136, blue: 153, alpha: 1 },
  lightsteelblue: { red: 176, green: 196, blue: 222, alpha: 1 },
  lightyellow: { red: 255, green: 255, blue: 224, alpha: 1 },
  lime: { red: 0, green: 255, blue: 0, alpha: 1 },
  limegreen: { red: 50, green: 205, blue: 50, alpha: 1 },
  linen: { red: 250, green: 240, blue: 230, alpha: 1 },
  magenta: { red: 255, green: 0, blue: 255, alpha: 1 },
  maroon: { red: 128, green: 0, blue: 0, alpha: 1 },
  mediumaquamarine: { red: 102, green: 205, blue: 170, alpha: 1 },
  mediumblue: { red: 0, green: 0, blue: 205, alpha: 1 },
  mediumorchid: { red: 186, green: 85, blue: 211, alpha: 1 },
  mediumpurple: { red: 147, green: 112, blue: 219, alpha: 1 },
  mediumseagreen: { red: 60, green: 179, blue: 113, alpha: 1 },
  mediumslateblue: { red: 123, green: 104, blue: 238, alpha: 1 },
  mediumspringgreen: { red: 0, green: 250, blue: 154, alpha: 1 },
  mediumturquoise: { red: 72, green: 209, blue: 204, alpha: 1 },
  mediumvioletred: { red: 199, green: 21, blue: 133, alpha: 1 },
  midnightblue: { red: 25, green: 25, blue: 112, alpha: 1 },
  mintcream: { red: 245, green: 255, blue: 250, alpha: 1 },
  mistyrose: { red: 255, green: 228, blue: 225, alpha: 1 },
  moccasin: { red: 255, green: 228, blue: 181, alpha: 1 },
  navajowhite: { red: 255, green: 222, blue: 173, alpha: 1 },
  navy: { red: 0, green: 0, blue: 128, alpha: 1 },
  oldlace: { red: 253, green: 245, blue: 230, alpha: 1 },
  olive: { red: 128, green: 128, blue: 0, alpha: 1 },
  olivedrab: { red: 107, green: 142, blue: 35, alpha: 1 },
  orange: { red: 255, green: 165, blue: 0, alpha: 1 },
  orangered: { red: 255, green: 69, blue: 0, alpha: 1 },
  orchid: { red: 218, green: 112, blue: 214, alpha: 1 },
  palegoldenrod: { red: 238, green: 232, blue: 170, alpha: 1 },
  palegreen: { red: 152, green: 251, blue: 152, alpha: 1 },
  paleturquoise: { red: 175, green: 238, blue: 238, alpha: 1 },
  palevioletred: { red: 219, green: 112, blue: 147, alpha: 1 },
  papayawhip: { red: 255, green: 239, blue: 213, alpha: 1 },
  peachpuff: { red: 255, green: 218, blue: 185, alpha: 1 },
  peru: { red: 205, green: 133, blue: 63, alpha: 1 },
  pink: { red: 255, green: 192, blue: 203, alpha: 1 },
  plum: { red: 221, green: 160, blue: 221, alpha: 1 },
  powderblue: { red: 176, green: 224, blue: 230, alpha: 1 },
  purple: { red: 128, green: 0, blue: 128, alpha: 1 },
  rebeccapurple: { red: 102, green: 51, blue: 153, alpha: 1 },
  red: { red: 255, green: 0, blue: 0, alpha: 1 },
  rosybrown: { red: 188, green: 143, blue: 143, alpha: 1 },
  royalblue: { red: 65, green: 105, blue: 225, alpha: 1 },
  saddlebrown: { red: 139, green: 69, blue: 19, alpha: 1 },
  salmon: { red: 250, green: 128, blue: 114, alpha: 1 },
  sandybrown: { red: 244, green: 164, blue: 96, alpha: 1 },
  seagreen: { red: 46, green: 139, blue: 87, alpha: 1 },
  seashell: { red: 255, green: 245, blue: 238, alpha: 1 },
  sienna: { red: 160, green: 82, blue: 45, alpha: 1 },
  silver: { red: 192, green: 192, blue: 192, alpha: 1 },
  skyblue: { red: 135, green: 206, blue: 235, alpha: 1 },
  slateblue: { red: 106, green: 90, blue: 205, alpha: 1 },
  slategray: { red: 112, green: 128, blue: 144, alpha: 1 },
  slategrey: { red: 112, green: 128, blue: 144, alpha: 1 },
  snow: { red: 255, green: 250, blue: 250, alpha: 1 },
  springgreen: { red: 0, green: 255, blue: 127, alpha: 1 },
  steelblue: { red: 70, green: 130, blue: 180, alpha: 1 },
  tan: { red: 210, green: 180, blue: 140, alpha: 1 },
  teal: { red: 0, green: 128, blue: 128, alpha: 1 },
  thistle: { red: 216, green: 191, blue: 216, alpha: 1 },
  tomato: { red: 255, green: 99, blue: 71, alpha: 1 },
  turquoise: { red: 64, green: 224, blue: 208, alpha: 1 },
  violet: { red: 238, green: 130, blue: 238, alpha: 1 },
  wheat: { red: 245, green: 222, blue: 179, alpha: 1 },
  white: { red: 255, green: 255, blue: 255, alpha: 1 },
  whitesmoke: { red: 245, green: 245, blue: 245, alpha: 1 },
  yellow: { red: 255, green: 255, blue: 0, alpha: 1 },
  yellowgreen: { red: 154, green: 205, blue: 50, alpha: 1 }
};
