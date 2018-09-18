import { isFeatureSupported } from "@siteimprove/alfa-compatibility";
import * as Lang from "@siteimprove/alfa-lang";
import { getNumericValue, Grammar, skip, Stream } from "@siteimprove/alfa-lang";
import { clamp, Mutable } from "@siteimprove/alfa-util";
import { Token, Tokens, TokenType } from "../../alphabet";
import { Values } from "../../values";
import { Color } from "./types";

const { min, round } = Math;

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

function getNumber(tokens: Array<Token>, index: number): Tokens.Number | null {
  if (index in tokens === false) {
    return null;
  }

  const token = tokens[index];

  if (token.type !== TokenType.Number) {
    return null;
  }

  return token;
}

function getPercentage(
  tokens: Array<Token>,
  index: number
): Tokens.Percentage | null {
  if (index in tokens === false) {
    return null;
  }

  const token = tokens[index];

  if (token.type !== TokenType.Percentage) {
    return null;
  }

  return token;
}

function rgbaColor(args: Array<Token>): Color {
  if (args.length === 4 && !isFeatureSupported("css.properties.color.alpha")) {
    return Transparent;
  }

  const color: Mutable<Color> = Values.color(0, 0, 0, 1);

  for (let i = 0, n = args.length; i < n; i++) {
    const component = args[i];

    if (
      component.type !== TokenType.Number &&
      component.type !== TokenType.Percentage
    ) {
      continue;
    }

    let { value } = component;

    if (i === 3) {
      value = clamp(value, 0, 1);
    } else {
      if (component.type === TokenType.Percentage) {
        value *= 255;
      }

      value = clamp(value, 0, 255);
    }

    color.value[i] = value;
  }

  return color;
}

function hslaColor(args: Array<Token>): Color {
  if (!isFeatureSupported("css.properties.color.hsl")) {
    return Transparent;
  }

  if (args.length === 4 && !isFeatureSupported("css.properties.color.alpha")) {
    return Transparent;
  }

  const hue = getNumber(args, 0);
  const saturation = getPercentage(args, 1);
  const lightness = getPercentage(args, 2);

  if (hue === null || saturation === null || lightness === null) {
    return Transparent;
  }

  const alpha = getNumber(args, 3);

  if (args.length === 4 && alpha === null) {
    return Transparent;
  }

  const [red, green, blue] = hslToRgb(
    clamp(hue.value, 0, 360) / 60,
    clamp(saturation.value * 100, 0, 360) / 100,
    clamp(lightness.value * 100, 0, 360) / 100
  );

  return Values.color(
    round(red * 255),
    round(green * 255),
    round(blue * 255),
    alpha === null ? 1 : clamp(alpha.value, 0, 1)
  );
}

/**
 * @copyright Copyright © 2016 W3C® (MIT, ERCIM, Keio, Beihang). W3C liability,
 * trademark and document use rules apply.
 * @license    https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */
function hslToRgb(
  hue: number,
  sat: number,
  light: number
): [number, number, number] {
  let t2;
  if (light <= 0.5) {
    t2 = light * (sat + 1);
  } else {
    t2 = light + sat - light * sat;
  }
  const t1 = light * 2 - t2;
  const r = hueToRgb(t1, t2, hue + 2);
  const g = hueToRgb(t1, t2, hue);
  const b = hueToRgb(t1, t2, hue - 2);
  return [r, g, b];
}

/**
 * @copyright Copyright © 2016 W3C® (MIT, ERCIM, Keio, Beihang). W3C liability,
 * trademark and document use rules apply.
 * @license    https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */
function hueToRgb(t1: number, t2: number, hue: number): number {
  if (hue < 0) {
    hue += 6;
  }
  if (hue >= 6) {
    hue -= 6;
  }

  if (hue < 1) {
    return (t2 - t1) * hue + t1;
  } else if (hue < 3) {
    return t2;
  } else if (hue < 4) {
    return (t2 - t1) * (4 - hue) + t1;
  } else {
    return t1;
  }
}

/**
 * @see https://www.w3.org/TR/css-color/#typedef-hex-color
 */
function hexColor(token: Tokens.Hash): Color {
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

  if (
    alpha &&
    !isFeatureSupported("css.properties.color.alpha_hexadecimal_notation")
  ) {
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

  return Values.color(
    (hex >> 24) & 0xff,
    (hex >> 16) & 0xff,
    (hex >> 8) & 0xff,
    (hex & 0xff) / 0xff
  );
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
      return NamedColors[token.value];
    }

    return null;
  }
};

const functionName: Production<Tokens.FunctionName> = {
  token: TokenType.FunctionName,
  prefix(token, stream) {
    const args = functionArguments(stream);
    const { length } = args;

    switch (token.value) {
      case "rgb":
        return length === 3 ? rgbaColor(args) : Transparent;
      case "rgba":
        return length === 4 ? rgbaColor(args) : Transparent;
      case "hsl":
        return length === 3 ? hslaColor(args) : Transparent;
      case "hsla":
        return length === 4 ? hslaColor(args) : Transparent;
    }

    return null;
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
export const Transparent: Color = Values.color(0, 0, 0, 0);

/**
 * @see https://www.w3.org/TR/css-color/#named-colors
 */
const NamedColors: { [name: string]: Color } = {
  aliceblue: Values.color(240, 248, 255, 1),
  antiquewhite: Values.color(250, 235, 215, 1),
  aqua: Values.color(0, 255, 255, 1),
  aquamarine: Values.color(127, 255, 212, 1),
  azure: Values.color(240, 255, 255, 1),
  beige: Values.color(245, 245, 220, 1),
  bisque: Values.color(255, 228, 196, 1),
  black: Values.color(0, 0, 0, 1),
  blanchedalmond: Values.color(255, 235, 205, 1),
  blue: Values.color(0, 0, 255, 1),
  blueviolet: Values.color(138, 43, 226, 1),
  brown: Values.color(165, 42, 42, 1),
  burlywood: Values.color(222, 184, 135, 1),
  cadetblue: Values.color(95, 158, 160, 1),
  chartreuse: Values.color(127, 255, 0, 1),
  chocolate: Values.color(210, 105, 30, 1),
  coral: Values.color(255, 127, 80, 1),
  cornflowerblue: Values.color(100, 149, 237, 1),
  cornsilk: Values.color(255, 248, 220, 1),
  crimson: Values.color(220, 20, 60, 1),
  cyan: Values.color(0, 255, 255, 1),
  darkblue: Values.color(0, 0, 139, 1),
  darkcyan: Values.color(0, 139, 139, 1),
  darkgoldenrod: Values.color(184, 134, 11, 1),
  darkgray: Values.color(169, 169, 169, 1),
  darkgreen: Values.color(0, 100, 0, 1),
  darkgrey: Values.color(169, 169, 169, 1),
  darkkhaki: Values.color(189, 183, 107, 1),
  darkmagenta: Values.color(139, 0, 139, 1),
  darkolivegreen: Values.color(85, 107, 47, 1),
  darkorange: Values.color(255, 140, 0, 1),
  darkorchid: Values.color(153, 50, 204, 1),
  darkred: Values.color(139, 0, 0, 1),
  darksalmon: Values.color(233, 150, 122, 1),
  darkseagreen: Values.color(143, 188, 143, 1),
  darkslateblue: Values.color(72, 61, 139, 1),
  darkslategray: Values.color(47, 79, 79, 1),
  darkslategrey: Values.color(47, 79, 79, 1),
  darkturquoise: Values.color(0, 206, 209, 1),
  darkviolet: Values.color(148, 0, 211, 1),
  deeppink: Values.color(255, 20, 147, 1),
  deepskyblue: Values.color(0, 191, 255, 1),
  dimgray: Values.color(105, 105, 105, 1),
  dimgrey: Values.color(105, 105, 105, 1),
  dodgerblue: Values.color(30, 144, 255, 1),
  firebrick: Values.color(178, 34, 34, 1),
  floralwhite: Values.color(255, 250, 240, 1),
  forestgreen: Values.color(34, 139, 34, 1),
  fuchsia: Values.color(255, 0, 255, 1),
  gainsboro: Values.color(220, 220, 220, 1),
  ghostwhite: Values.color(248, 248, 255, 1),
  gold: Values.color(255, 215, 0, 1),
  goldenrod: Values.color(218, 165, 32, 1),
  gray: Values.color(128, 128, 128, 1),
  green: Values.color(0, 128, 0, 1),
  greenyellow: Values.color(173, 255, 47, 1),
  grey: Values.color(128, 128, 128, 1),
  honeydew: Values.color(240, 255, 240, 1),
  hotpink: Values.color(255, 105, 180, 1),
  indianred: Values.color(205, 92, 92, 1),
  indigo: Values.color(75, 0, 130, 1),
  ivory: Values.color(255, 255, 240, 1),
  khaki: Values.color(240, 230, 140, 1),
  lavender: Values.color(230, 230, 250, 1),
  lavenderblush: Values.color(255, 240, 245, 1),
  lawngreen: Values.color(124, 252, 0, 1),
  lemonchiffon: Values.color(255, 250, 205, 1),
  lightblue: Values.color(173, 216, 230, 1),
  lightcoral: Values.color(240, 128, 128, 1),
  lightcyan: Values.color(224, 255, 255, 1),
  lightgoldenrodyellow: Values.color(250, 250, 210, 1),
  lightgray: Values.color(211, 211, 211, 1),
  lightgreen: Values.color(144, 238, 144, 1),
  lightgrey: Values.color(211, 211, 211, 1),
  lightpink: Values.color(255, 182, 193, 1),
  lightsalmon: Values.color(255, 160, 122, 1),
  lightseagreen: Values.color(32, 178, 170, 1),
  lightskyblue: Values.color(135, 206, 250, 1),
  lightslategray: Values.color(119, 136, 153, 1),
  lightslategrey: Values.color(119, 136, 153, 1),
  lightsteelblue: Values.color(176, 196, 222, 1),
  lightyellow: Values.color(255, 255, 224, 1),
  lime: Values.color(0, 255, 0, 1),
  limegreen: Values.color(50, 205, 50, 1),
  linen: Values.color(250, 240, 230, 1),
  magenta: Values.color(255, 0, 255, 1),
  maroon: Values.color(128, 0, 0, 1),
  mediumaquamarine: Values.color(102, 205, 170, 1),
  mediumblue: Values.color(0, 0, 205, 1),
  mediumorchid: Values.color(186, 85, 211, 1),
  mediumpurple: Values.color(147, 112, 219, 1),
  mediumseagreen: Values.color(60, 179, 113, 1),
  mediumslateblue: Values.color(123, 104, 238, 1),
  mediumspringgreen: Values.color(0, 250, 154, 1),
  mediumturquoise: Values.color(72, 209, 204, 1),
  mediumvioletred: Values.color(199, 21, 133, 1),
  midnightblue: Values.color(25, 25, 112, 1),
  mintcream: Values.color(245, 255, 250, 1),
  mistyrose: Values.color(255, 228, 225, 1),
  moccasin: Values.color(255, 228, 181, 1),
  navajowhite: Values.color(255, 222, 173, 1),
  navy: Values.color(0, 0, 128, 1),
  oldlace: Values.color(253, 245, 230, 1),
  olive: Values.color(128, 128, 0, 1),
  olivedrab: Values.color(107, 142, 35, 1),
  orange: Values.color(255, 165, 0, 1),
  orangered: Values.color(255, 69, 0, 1),
  orchid: Values.color(218, 112, 214, 1),
  palegoldenrod: Values.color(238, 232, 170, 1),
  palegreen: Values.color(152, 251, 152, 1),
  paleturquoise: Values.color(175, 238, 238, 1),
  palevioletred: Values.color(219, 112, 147, 1),
  papayawhip: Values.color(255, 239, 213, 1),
  peachpuff: Values.color(255, 218, 185, 1),
  peru: Values.color(205, 133, 63, 1),
  pink: Values.color(255, 192, 203, 1),
  plum: Values.color(221, 160, 221, 1),
  powderblue: Values.color(176, 224, 230, 1),
  purple: Values.color(128, 0, 128, 1),
  rebeccapurple: Values.color(102, 51, 153, 1),
  red: Values.color(255, 0, 0, 1),
  rosybrown: Values.color(188, 143, 143, 1),
  royalblue: Values.color(65, 105, 225, 1),
  saddlebrown: Values.color(139, 69, 19, 1),
  salmon: Values.color(250, 128, 114, 1),
  sandybrown: Values.color(244, 164, 96, 1),
  seagreen: Values.color(46, 139, 87, 1),
  seashell: Values.color(255, 245, 238, 1),
  sienna: Values.color(160, 82, 45, 1),
  silver: Values.color(192, 192, 192, 1),
  skyblue: Values.color(135, 206, 235, 1),
  slateblue: Values.color(106, 90, 205, 1),
  slategray: Values.color(112, 128, 144, 1),
  slategrey: Values.color(112, 128, 144, 1),
  snow: Values.color(255, 250, 250, 1),
  springgreen: Values.color(0, 255, 127, 1),
  steelblue: Values.color(70, 130, 180, 1),
  tan: Values.color(210, 180, 140, 1),
  teal: Values.color(0, 128, 128, 1),
  thistle: Values.color(216, 191, 216, 1),
  tomato: Values.color(255, 99, 71, 1),
  turquoise: Values.color(64, 224, 208, 1),
  violet: Values.color(238, 130, 238, 1),
  wheat: Values.color(245, 222, 179, 1),
  white: Values.color(255, 255, 255, 1),
  whitesmoke: Values.color(245, 245, 245, 1),
  yellow: Values.color(255, 255, 0, 1),
  yellowgreen: Values.color(154, 205, 50, 1)
};
