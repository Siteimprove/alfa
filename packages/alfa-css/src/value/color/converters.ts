/*
 * Most code here is taken directly from the CSS Color Module Level 4
 * specification, with adjustments for our representations. Many comments
 * also come from there, as is.
 * {@link https://drafts.csswg.org/css-color-4/#color-conversion-code}
 * {@link https://drafts.csswg.org/css-color/#hsl-to-rgb}
 * {@link https://drafts.csswg.org/css-color/#hwb-to-rgb}
 */

import type { Mapper } from "@siteimprove/alfa-mapper";
import { Matrix, type Vector } from "@siteimprove/alfa-math";
import type { Predicate } from "@siteimprove/alfa-predicate";

/**
 * {@link https://drafts.csswg.org/css-color/#hsl-to-rgb}
 *
 * @param hue - The hue component, in degrees, as a number between 0 and 360.
 * @param saturation - The saturation component, as a number between 0 and 1.
 * @param lightness - The lightness component, as a number between 0 and 1.
 *
 * @internal
 */
export function hslToRgb(
  hue: number,
  saturation: number,
  lightness: number,
): [red: number, green: number, blue: number] {
  function f(n: number) {
    let k = (n + hue / 30) % 12;
    let a = saturation * Math.min(lightness, 1 - lightness);
    return lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  }

  return [f(0), f(8), f(4)];
}

/**
 * {@link https://drafts.csswg.org/css-color/#hwb-to-rgb}
 *
 * @param hue - The hue component, in degrees, as a number between 0 and 360.
 * @param whiteness - The whiteness component, as a number between 0 and 1.
 * @param blackness - The blackness component, as a number between 0 and 1.
 *
 * @internal
 */
export function hwbToRgb(
  hue: number,
  whiteness: number,
  blackness: number,
): [red: number, green: number, blue: number] {
  if (whiteness + blackness >= 1) {
    let gray = whiteness / (whiteness + blackness);
    return [gray, gray, gray];
  }
  let rgb = hslToRgb(hue, 1, 0.5);
  for (let i = 0; i < 3; i++) {
    rgb[i] *= 1 - whiteness - blackness;
    rgb[i] += whiteness;
  }
  return rgb;
}

/*
 * Matrices are in column-major order in the CSS specifications.
 * This is a bit awkward to work with, notably due to the multiplication order
 * when piling up transformations, so we use them in row-major order here.
 * All matrices are transposed once at load-time, so we can keep them same as
 * in the CSS specs in this file, making it easier to compare.
 */

/**
 * Standard white points, defined by 4-figure CIE x,y chromaticities
 *
 * @privateRemarks
 * Since only two are used, we can have a simple conversion matrix for each,
 * there is only one destination.
 */
const whitepoints = {
  D50: {
    value: [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585],
    // Bradford chromatic adaptation from D50 to D65
    // See https://github.com/LeaVerou/color.js/pull/360/files
    convert: Matrix.transpose([
      [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
      [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
      [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
    ]),
  },
  D65: {
    value: [0.3127 / 0.329, 1.0, (1.0 - 0.3127 - 0.329) / 0.329],
    // Bradford chromatic adaptation from D65 to D50
    // The matrix below is the result of three operations:
    // - convert from XYZ to retinal cone domain
    // - scale components from one reference white to another
    // - convert back to XYZ
    // see https://github.com/LeaVerou/color.js/pull/354/files
    convert: Matrix.transpose([
      [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
      [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
      [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
    ]),
  },
} as const;

/** @internal */
export const colorSpaces = [
  "a98-rgb",
  "display-p3",
  "prophoto-rgb",
  "rec2020",
  "sRGB",
] as const;
/** @internal */
export type ColorSpace = (typeof colorSpaces)[number];

/** internal */
export type RGB<S extends ColorSpace> = {
  space: S;
  linear: boolean; // whether the color is in linear-light form
  components: Vector; // RGB components in the range 0.0-1.0
};

interface RGBColorSpace<S extends ColorSpace> {
  space: S;
  whitepoint: keyof typeof whitepoints;
  gammaEncoding: Mapper<number>;
  gammaDecoding: Mapper<number>;
  toXYZ: Matrix;
  fromXYZ: Matrix;
}

/**
 * Convert an RGB color from one color space to another.
 * {@link https://drafts.csswg.org/css-color/#predefined-to-predefined}
 */
export function convertRGB<SRC extends ColorSpace, DEST extends ColorSpace>(
  source: RGB<SRC>,
  destination: { space: DEST; linear: boolean },
): RGB<DEST> {
  const srcSpace = spaces[source.space];
  const destSpace = spaces[destination.space];

  if ((source.space as ColorSpace) === (destination.space as ColorSpace)) {
    // If we are in the same color space, avoid doing back and forth XYZ
    // conversions.
    if (source.linear === destination.linear) {
      return source as unknown as RGB<DEST>;
    }

    return {
      space: destination.space,
      linear: destination.linear,
      components: source.components.map(
        source.linear ? srcSpace.gammaEncoding : srcSpace.gammaDecoding,
      ),
    };
  }

  // 1. Undo gamma encoding, if needed.
  // This is a pointwise operation on the components.
  const sourceLinear: Vector = source.linear
    ? source.components
    : source.components.map(srcSpace.gammaDecoding);

  // 2., 3., 4. convert to XYZ, adjust whitepoint, convert to destination space
  // These are all linear transformations, so we can do them in one go.
  const destLinear: Vector = multiply(
    sourceLinear,
    RGBLinearConverters[source.space][
      // The conversion is safe because we already checked that
      // source.space !== destination.space
      destination.space as unknown as Exclude<ColorSpace, SRC>
    ] as Matrix,
  );

  return {
    space: destination.space,
    linear: destination.linear,
    // 5. Apply gamma encoding, if needed.
    // This is a pointwise operation on the components.
    components: destination.linear
      ? destLinear
      : destLinear.map(destSpace.gammaEncoding),
  };
}

const spaces: { [key in ColorSpace]: RGBColorSpace<key> } = {
  "a98-rgb": {
    space: "a98-rgb",
    whitepoint: "D65",

    /**
     * Convert a color component in a98-rgb form to a98-rgb-linear
     * (undo gamma encoding).
     *
     * @param value - A a98-rgb color component in the range 0.0-1.0
     */
    gammaDecoding: gammaCorrection(563 / 256),

    /**
     * Convert a color component in a98-rgb-linear form to a98-rgb
     * (apply gamma encoding).
     *
     * @param value - A a98-rgb-linear color component in the range 0.0-1.0
     */
    gammaEncoding: gammaCorrection(256 / 563),

    /**
     * Matrix for converting a98-rgb-linear to CIE XYZ
     * (no chromatic adaptation).
     */
    toXYZ: Matrix.transpose([
      [573536 / 994567, 263643 / 1420810, 187206 / 994567],
      [591459 / 1989134, 6239551 / 9945670, 374412 / 4972835],
      [53769 / 1989134, 351524 / 4972835, 4929758 / 4972835],
    ]),

    /**
     * Matrix for converting XYZ to a98-rgb-linear (no chromatic adaptation).
     */
    fromXYZ: Matrix.transpose([
      [1829569 / 896150, -506331 / 896150, -308931 / 896150],
      [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
      [16779 / 1248040, -147721 / 1248040, 1266979 / 1248040],
    ]),
  },

  "display-p3": {
    space: "display-p3",
    whitepoint: "D65",

    /**
     * Convert a color component in display-p3 RGB form to display-p3-linear
     * (undo gamma encoding).
     *
     * @param value - A display-p3 color component in the range 0.0-1.0
     */
    gammaDecoding,

    /**
     * Convert a color component in display-p3-linear form to display-p3
     * (apply gamma encoding).
     *
     * @param value - A display-p3-linear color component in the range 0.0-1.0
     */
    gammaEncoding,

    /**
     * Matrix for converting display-p3-linear to CIE XYZ
     * (no chromatic adaptation).
     */
    toXYZ: Matrix.transpose([
      [608311 / 1250200, 189793 / 714400, 198249 / 1000160],
      [35783 / 156275, 247089 / 357200, 198249 / 2500400],
      [0, 32229 / 714400, 5220557 / 5000800],
    ]),

    /**
     * Matrix for converting XYZ to display-p3-linear (no chromatic adaptation).
     */
    fromXYZ: Matrix.transpose([
      [446124 / 178915, -333277 / 357830, -72051 / 178915],
      [-14852 / 17905, 63121 / 35810, 423 / 17905],
      [11844 / 330415, -50337 / 660830, 316169 / 330415],
    ]),
  },

  "prophoto-rgb": {
    space: "prophoto-rgb",
    whitepoint: "D50",

    /**
     * Convert a color component in prophoto-rgb form to prophoto-rgb-linear
     * (undo gamma encoding).
     *
     * @remarks
     * Transfer curve is gamma 1.8 with a small linear portion extended
     * transfer function.
     *
     * @param value - A prophoto-rgb color component in the range 0.0-1.0
     */
    gammaDecoding: gammaCorrection(1.8, (value) => value <= 16 / 512, 1 / 16),

    /**
     * Convert a color component in prophoto-rgb-linear form to prophoto-rgb
     * (apply gamma encoding).
     *
     * @remarks
     * Transfer curve is gamma 1.8 with a small linear portion.
     *
     * @param value - A prophoto-rgb-linear color component in the range 0.0-1.0
     */
    gammaEncoding: gammaCorrection(1 / 1.8, (value) => value < 1 / 512, 16),

    /**
     * Matrix for converting prophoto-rgb-linear to CIE XYZ
     * (no chromatic adaptation).
     *
     * @remarks
     * The matrix cannot be expressed in rational form, but is calculated to
     * 64 bits accuracy.
     * {@link https://github.com/w3c/csswg-drafts/issues/7675}
     */
    toXYZ: Matrix.transpose([
      [0.7977666449006423, 0.13518129740053308, 0.0313477341283922],
      [0.2880748288194013, 0.711835234241873, 0.00008993693872564],
      [0.0, 0.0, 0.8251046025104602],
    ]),

    /**
     * Matrix for converting XYZ to prophoto-rgb-linear (no chromatic adaptation).
     */
    fromXYZ: Matrix.transpose([
      [1.3457868816471583, -0.25557208737979464, -0.05110186497554526],
      [-0.5446307051249019, 1.5082477428451468, 0.02052744743642139],
      [0.0, 0.0, 1.2119675456389452],
    ]),
  },

  rec2020: {
    space: "rec2020",
    whitepoint: "D65",

    /**
     * Convert a color component in rec2020 form to rec2020-linear
     * (undo gamma encoding).
     *
     * @param value - A rec2020 color component in the range 0.0-1.0
     *
     * @privateRemarks
     * There is some discussions and inconsistencies about the exact transfer
     * function for rec2020. The one used here is the one from the CSS
     * Color Module Level 4, October 2025.
     * {@link https://drafts.csswg.org/css-color/#predefined-rec2020}
     * It seems vendors are not all using it, and online converters also give
     * various results.
     * {@link https://github.com/w3c/csswg-drafts/issues/12574}
     * If this causes problems, we will need to revisit this.
     */
    gammaDecoding: gammaCorrection(2.4),

    /**
     * Convert a color component in rec2020-linear form to rec2020
     * (apply gamma encoding).
     *
     * @param value - A rec2020-linear color component in the range 0.0-1.0
     *
     * @privateRemarks
     * There is some discussion and inconsistency about the exact transfer
     * function for rec2020. The one used here is the one from the CSS
     * Color Module Level 4, October 2025.
     * {@link https://drafts.csswg.org/css-color/#predefined-rec2020}
     * It seems vendors are not all using it, and online converters also give
     * various results.
     * {@link https://github.com/w3c/csswg-drafts/issues/12574}
     * If this causes problems, we will need to revisit this.
     */
    gammaEncoding: gammaCorrection(1 / 2.4),

    /**
     * Matrix for converting rec2020-linear to CIE XYZ (no chromatic adaptation).
     */
    toXYZ: Matrix.transpose([
      [63426534 / 99577255, 20160776 / 139408157, 47086771 / 278816314],
      [26158966 / 99577255, 472592308 / 697040785, 8267143 / 139408157],
      [0, 19567812 / 697040785, 295819943 / 278816314],
    ]),

    /**
     * Matrix for converting XYZ to rec2020-linear (no chromatic adaptation).
     */
    fromXYZ: Matrix.transpose([
      [30757411 / 17917100, -6372589 / 17917100, -4539589 / 17917100],
      [-19765991 / 29648200, 47925759 / 29648200, 467509 / 29648200],
      [792561 / 44930125, -1921689 / 44930125, 42328811 / 44930125],
    ]),
  },

  sRGB: {
    space: "sRGB",
    whitepoint: "D65",

    /**
     * Convert a sRGB color component to sRGB-linear (undo gamma encoding).
     * {@link https://en.wikipedia.org/wiki/SRGB}
     *
     * @remarks
     * Extended transfer function:
     * for negative values, linear portion is extended on reflection of axis,
     * then reflected power function is used.
     *
     * @param value - A sRGB color component in the range 0.0-1.0
     */
    gammaDecoding,

    /**
     * Convert a sRGB-linear color component to sRGB (apply gamma encoding).
     * {@link https://en.wikipedia.org/wiki/SRGB}
     *
     * @remarks
     * Extended transfer function:
     * For negative values, linear portion extends on reflection of axis, then
     * uses reflected pow below that
     *
     * @param value - A sRGB-linear color component in the range 0.0-1.0
     */
    gammaEncoding,

    /**
     * Matrix for converting sRGB-linear to CIE XYZ (no chromatic adaptation).
     */
    toXYZ: Matrix.transpose([
      [506752 / 1228815, 87881 / 245763, 12673 / 70218],
      [87098 / 409605, 175762 / 245763, 12673 / 175545],
      [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
    ]),

    /**
     * Matrix for converting XYZ to sRGB-linear (no chromatic adaptation).
     */
    fromXYZ: Matrix.transpose([
      [12831 / 3959, -329 / 214, -1974 / 3959],
      [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
      [705 / 12673, -2585 / 12673, 705 / 667],
    ]),
  },
};

/**
 * Pre-compute the linear conversion matrix between two RGB color spaces.
 */
function linearConverter(source: ColorSpace, destination: ColorSpace): Matrix {
  const srcSpace = spaces[source];
  const destSpace = spaces[destination];

  // 2., 3., 4. convert to XYZ, adjust whitepoint, convert to destination space
  // 2. to XYZ
  let mat: Matrix = srcSpace.toXYZ;
  // 3. adjust whitepoint if needed (chromatic adaptation)
  if (srcSpace.whitepoint !== destSpace.whitepoint) {
    mat = Matrix.multiply(mat, whitepoints[srcSpace.whitepoint].convert);
  }
  // 4. from XYZ to destination space
  mat = Matrix.multiply(mat, destSpace.fromXYZ);

  return mat;
}

/**
 * Matrices for converting between RGB color spaces in linear-light form.
 */
const RGBLinearConverters = colorSpaces.reduce(
  // We can't really be clever with types here because the objects are built
  // piece by piece, so the accumulators can only have the partial types, and
  // that becomes a total mess that TS cannot handle anyway…
  // So we build them ignoring the types of keys and then assert the type.
  (acc: { [source: string]: { [destination: string]: Matrix } }, source) => {
    acc[source] = colorSpaces.reduce(
      (acc: { [destination: string]: Matrix }, dest) => {
        if (source !== dest) {
          acc[dest] = linearConverter(
            source,
            dest as Exclude<ColorSpace, typeof source>,
          );
        }
        return acc;
      },
      {},
    );

    return acc;
  },
  {},
) as {
  [source in ColorSpace]: {
    [destination in Exclude<ColorSpace, source>]: Matrix;
  };
};

// CIE Lab and LCH

// function XYZ_to_Lab(XYZ: Vector): Vector {
//   // Assuming XYZ is relative to D50, convert to CIE Lab
//   // from CIE standard, which now defines these as a rational fraction
//   const epsilon = 216 / 24389; // 6^3/29^3
//   const kappa = 24389 / 27; // 29^3/3^3
//
//   // compute xyz, which is XYZ scaled relative to reference white
//   const xyz = XYZ.map((value, i) => value / whitepoints.D50.value[i]);
//
//   // now compute f
//   const f = xyz.map((value) =>
//     value > epsilon ? Math.cbrt(value) : (kappa * value + 16) / 116,
//   );
//
//   return [
//     116 * f[1] - 16, // L
//     500 * (f[0] - f[1]), // a
//     200 * (f[1] - f[2]), // b
//   ];
//   // L in range [0,100]. For use in CSS, add a percent
// }
//
// function Lab_to_XYZ(Lab: Vector): Vector {
//   // Convert Lab to D50-adapted XYZ
//   // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
//   const kappa = 24389 / 27; // 29^3/3^3
//   const epsilon = 216 / 24389; // 6^3/29^3
//   const f = [];
//
//   // compute f, starting with the luminance-related term
//   f[1] = (Lab[0] + 16) / 116;
//   f[0] = Lab[1] / 500 + f[1];
//   f[2] = f[1] - Lab[2] / 200;
//
//   // compute xyz
//   const xyz = [
//     Math.pow(f[0], 3) > epsilon ? Math.pow(f[0], 3) : (116 * f[0] - 16) / kappa,
//     Lab[0] > kappa * epsilon
//       ? Math.pow((Lab[0] + 16) / 116, 3)
//       : Lab[0] / kappa,
//     Math.pow(f[2], 3) > epsilon ? Math.pow(f[2], 3) : (116 * f[2] - 16) / kappa,
//   ];
//
//   // Compute XYZ by scaling xyz by reference white
//   return xyz.map((value, i) => value * whitepoints.D50.value[i]);
// }

// function Lab_to_LCH(Lab: Vector): Vector {
//   const epsilon = 0.0015;
//   const chroma = Math.sqrt(Math.pow(Lab[1], 2) + Math.pow(Lab[2], 2)); // Chroma
//   let hue = (Math.atan2(Lab[2], Lab[1]) * 180) / Math.PI;
//
//   if (hue < 0) {
//     hue = hue + 360;
//   }
//
//   if (chroma <= epsilon) {
//     hue = NaN;
//   }
//
//   return [
//     Lab[0], // L is still L
//     chroma, // Chroma
//     hue, // Hue, in degrees [0 to 360)
//   ];
// }
//
// function LCH_to_Lab(LCH: Vector): Vector {
//   // Convert from polar form
//   return [
//     LCH[0], // L is still L
//     LCH[1] * Math.cos((LCH[2] * Math.PI) / 180), // a
//     LCH[1] * Math.sin((LCH[2] * Math.PI) / 180), // b
//   ];
// }

// OKLab and OKLCH
// https://bottosson.github.io/posts/oklab/

// XYZ <-> LMS matrices recalculated for consistent reference white
// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484
// recalculated for 64bit precision
// see https://github.com/color-js/color.js/pull/357

// function XYZ_to_OKLab(XYZ: Vector): Vector {
//   // Given XYZ relative to D65, convert to OKLab
//   const XYZtoLMS: Matrix = [
//     [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
//     [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
//     [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
//   ];
//   const LMStoOKLab: Matrix = [
//     [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
//     [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
//     [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
//   ];
//
//   const LMS = multiply(XYZtoLMS, XYZ);
//   // JavaScript Math.cbrt returns a sign-matched cube root
//   // beware if porting to other languages
//   // especially if tempted to use a general power function
//
//   return multiply(
//     LMStoOKLab,
//     LMS.map((c) => Math.cbrt(c)),
//   );
//   // L in range [0,1]. For use in CSS, multiply by 100 and add a percent
// }
//
// function OKLab_to_XYZ(OKLab: Vector): Vector {
//   // Given OKLab, convert to XYZ relative to D65
//   const LMStoXYZ: Matrix = [
//     [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
//     [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
//     [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
//   ];
//   const OKLabtoLMS = [
//     [1.0, 0.3963377773761749, 0.2158037573099136],
//     [1.0, -0.1055613458156586, -0.0638541728258133],
//     [1.0, -0.0894841775298119, -1.2914855480194092],
//   ];
//
//   const LMSnl = multiply(OKLabtoLMS, OKLab);
//   return multiply(
//     LMStoXYZ,
//     LMSnl.map((c) => c ** 3),
//   );
// }

// function OKLab_to_OKLCH(OKLab: Vector): Vector {
//   const epsilon = 0.000004;
//   let hue = (Math.atan2(OKLab[2], OKLab[1]) * 180) / Math.PI;
//   const chroma = Math.sqrt(OKLab[1] ** 2 + OKLab[2] ** 2);
//
//   if (hue < 0) {
//     hue = hue + 360;
//   }
//
//   if (chroma <= epsilon) {
//     hue = NaN;
//   }
//
//   return [
//     OKLab[0], // L is still L
//     chroma,
//     hue,
//   ];
// }
//
// function OKLCH_to_OKLab(OKLCH: Vector): Vector {
//   return [
//     OKLCH[0], // L is still L
//     OKLCH[1] * Math.cos((OKLCH[2] * Math.PI) / 180), // a
//     OKLCH[1] * Math.sin((OKLCH[2] * Math.PI) / 180), // b
//   ];
// }

/**
 * Return the first row of a matrix as a vector.
 */
function toVector(m: Matrix): Vector {
  return m[0];
}

/**
 * Multiply a vector by a matrix.
 */
function multiply(v: Vector, m: Matrix): Vector {
  return toVector(Matrix.multiply(v, m));
}

/**
 * Gamma decoding for sRBG and display-p3 color spaces.
 *
 * @privateRemarks
 * This does some linear correction before the power-law, so it's not a regular
 * gamma correction.
 */
function gammaDecoding(value: number): number {
  let sign = value < 0 ? -1 : 1;
  let abs = Math.abs(value);

  if (abs <= 0.04045) {
    return value / 12.92;
  }

  return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
}

/**
 * Gamma encoding for sRBG and display-p3 color spaces.
 *
 * @privateRemarks
 * This does some linear correction after the power-law, so it's not a regular
 * gamma correction.
 */
function gammaEncoding(value: number): number {
  let sign = value < 0 ? -1 : 1;
  let abs = Math.abs(value);

  if (abs > 0.0031308) {
    return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
  }

  return 12.92 * value;
}

/**
 * Computes gamma correction, as a power-law function with optional linear
 * portion.
 * {@link https://en.wikipedia.org/wiki/Gamma_correction}
 *
 * @param gamma - The gamma value to use for the correction.
 * @param linearRange - Whether a value is in the linear range
 * @param linearCoefficient - The coefficient to apply in the linear range
 *
 * @returns A function that applies gamma correction to a value.
 */
function gammaCorrection(
  gamma: number,
  linearRange: Predicate<number> = () => false,
  linearCoefficient: number = 1,
): Mapper<number> {
  return function (value: number): number {
    let sign = value < 0 ? -1 : 1;
    let abs = Math.abs(value);

    if (linearRange(abs)) {
      return linearCoefficient * value;
    }

    return sign * Math.pow(abs, gamma);
  };
}
