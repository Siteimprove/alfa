/**
 * Most code here is taken directly from the CSS Color Module Level 4
 * specification, with adjustments for our representations.
 * {@link https://drafts.csswg.org/css-color-4/#color-conversion-code}
 * {@link https://drafts.csswg.org/css-color/#hsl-to-rgb}
 * {@link https://drafts.csswg.org/css-color/#hwb-to-rgb}
 */

import { Matrix, type Vector } from "@siteimprove/alfa-math";

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
 * when piling up transformation, so we use them in row-major order here.
 * All matrices are transposed once at load-time, so we can keep them same as
 * in the CSS specs in this file, making it easier to fix.
 */

// standard white points, defined by 4-figure CIE x,y chromaticities
const whitepoints: { [key: string]: Vector } = {
  D50: [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585],
  D65: [0.3127 / 0.329, 1.0, (1.0 - 0.3127 - 0.329) / 0.329],
};

/** @internal */
export type ColorSpace = "sRGB" | "display-p3";
// | "prophoto-rgb"
// | "a98-rgb"
// | "rec2020";

/** internal */
export type RGB<S extends ColorSpace> = {
  space: S;
  linear: boolean; // whether the color is in linear-light form
  components: Vector; // RGB components in the range 0.0-1.0
};

interface RGBColorSpace<S extends ColorSpace> {
  space: S;
  whitepoint: keyof typeof whitepoints;
  gammaEncoding: (value: number) => number;
  gammaDecoding: (value: number) => number;
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
  const sourceLinear: Vector = source.linear
    ? source.components
    : source.components.map(srcSpace.gammaDecoding);

  // 2., 3., 4. convert to XYZ, adjust whitepoint, convert to destination space
  // We pile up the matrix multiplications to limit the Vector <-> Matrix
  // conversions.
  // WARNING! Due to column-major order, we need to apply the matrices in
  // reverse order.
  // 2. to XYZ
  let mat: Matrix = srcSpace.toXYZ;
  // 3. adjust whitepoint if needed
  if (srcSpace.whitepoint !== destSpace.whitepoint) {
    mat = Matrix.multiply(
      srcSpace.whitepoint === "D50" ? D50_to_D65 : D65_to_D50,
      mat,
    );
  }
  // 4. from XYZ to destination space
  mat = Matrix.multiply(destSpace.fromXYZ, mat);

  const destLinear: Vector = multiply(mat, sourceLinear);

  return {
    space: destination.space,
    linear: destination.linear,
    components: destination.linear
      ? destLinear
      : destLinear.map(destSpace.gammaEncoding),
  };
}

const spaces: { [key in ColorSpace]: RGBColorSpace<key> } = {
  sRGB: {
    space: "sRGB",
    whitepoint: "D65",

    /**
     * Convert a sRGB color to sRGB-linear (undo gamma encoding).
     * {@link https://en.wikipedia.org/wiki/SRGB}
     *
     * @remarks
     * Extended transfer function:
     * for negative values, linear portion is extended on reflection of axis,
     * then reflected power function is used.
     *
     * @param RGB - A sRGB color as a Vector of 3 components in the range 0.0-1.0
     */
    gammaDecoding(value: number): number {
      let sign = value < 0 ? -1 : 1;
      let abs = Math.abs(value);

      if (abs <= 0.04045) {
        return value / 12.92;
      }

      return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
    },

    /**
     * Convert a sRGB-linear color to sRGB (apply gamma encoding).
     * {@link https://en.wikipedia.org/wiki/SRGB}
     *
     * @remarks
     * Extended transfer function:
     * For negative values, linear portion extends on reflection of axis, then
     * uses reflected pow below that
     *
     * @param RGB - A sRGB-linear color as a Vector of 3 components in the range 0.0-1.0
     */
    gammaEncoding(value: number): number {
      let sign = value < 0 ? -1 : 1;
      let abs = Math.abs(value);

      if (abs > 0.0031308) {
        return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
      }

      return 12.92 * value;
    },

    /**
     * Convert a sRGB-linear values to CIE XYZ, using sRGB's own white, D65
     * (no chromatic adaptation)
     *
     * @param RGB - A sRGB-linear color as a vector of 3 components in the range 0.0-1.0
     */
    toXYZ: [
      [506752 / 1228815, 87881 / 245763, 12673 / 70218],
      [87098 / 409605, 175762 / 245763, 12673 / 175545],
      [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
    ],

    /**
     * Convert XYZ to sRGB-linear.
     *
     * @param XYZ - A CIE XYZ color as a vector of 3 components.
     */
    fromXYZ: [
      [12831 / 3959, -329 / 214, -1974 / 3959],
      [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
      [705 / 12673, -2585 / 12673, 705 / 667],
    ],
  },

  "display-p3": {
    space: "display-p3",
    whitepoint: "D65",

    /**
     * Convert a color in display-p3 RGB form to display-p3-linear
     * (undo gamma encoding).
     *
     * @param RGB - A display-p3 color as a Vector of 3 components in the range 0.0-1.0
     */
    gammaDecoding(value: number): number {
      let sign = value < 0 ? -1 : 1;
      let abs = Math.abs(value);

      if (abs <= 0.04045) {
        return value / 12.92;
      }

      return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
    },

    /**
     * Convert a color in display-p3-linear form to display-p3 (apply gamma encoding).
     *
     * @param RGB - A display-p3-linear color as a Vector of 3 components in the range 0.0-1.0
     */
    gammaEncoding(value: number): number {
      let sign = value < 0 ? -1 : 1;
      let abs = Math.abs(value);

      if (abs > 0.0031308) {
        return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
      }

      return 12.92 * value;
    },

    toXYZ: [
      [608311 / 1250200, 189793 / 714400, 198249 / 1000160],
      [35783 / 156275, 247089 / 357200, 198249 / 2500400],
      [0 / 1, 32229 / 714400, 5220557 / 5000800],
    ],

    fromXYZ: [
      [446124 / 178915, -333277 / 357830, -72051 / 178915],
      [-14852 / 17905, 63121 / 35810, 423 / 17905],
      [11844 / 330415, -50337 / 660830, 316169 / 330415],
    ],
  },
};

// prophoto-rgb functions

function lin_ProPhoto(RGB: Vector): Vector {
  // convert an array of prophoto-rgb values
  // where in-gamut colors are in the range [0.0 - 1.0]
  // to linear light (un-companded) form.
  // Transfer curve is gamma 1.8 with a small linear portion
  // Extended transfer function
  const Et2 = 16 / 512;

  return RGB.map(function (val) {
    let sign = val < 0 ? -1 : 1;
    let abs = Math.abs(val);

    if (abs <= Et2) {
      return val / 16;
    }

    return sign * Math.pow(abs, 1.8);
  });
}

function gam_ProPhoto(RGB: Vector): Vector {
  // convert an array of linear-light prophoto-rgb  in the range 0.0-1.0
  // to gamma corrected form
  // Transfer curve is gamma 1.8 with a small linear portion
  // TODO for negative values, extend linear portion on reflection of axis, then add pow below that
  const Et = 1 / 512;
  return RGB.map(function (val) {
    let sign = val < 0 ? -1 : 1;
    let abs = Math.abs(val);

    if (abs >= Et) {
      return sign * Math.pow(abs, 1 / 1.8);
    }

    return 16 * val;
  });
}

function lin_ProPhoto_to_XYZ(rgb: Vector): Vector {
  // convert an array of linear-light prophoto-rgb values to CIE D50 XYZ
  // matrix cannot be expressed in rational form, but is calculated to 64 bit accuracy
  // see https://github.com/w3c/csswg-drafts/issues/7675
  const M: Matrix = [
    [0.7977666449006423, 0.13518129740053308, 0.0313477341283922],
    [0.2880748288194013, 0.711835234241873, 0.00008993693872564],
    [0.0, 0.0, 0.8251046025104602],
  ];

  return multiply(M, rgb);
}

function XYZ_to_lin_ProPhoto(XYZ: Vector): Vector {
  // convert D50 XYZ to linear-light prophoto-rgb
  const M: Matrix = [
    [1.3457868816471583, -0.25557208737979464, -0.05110186497554526],
    [-0.5446307051249019, 1.5082477428451468, 0.02052744743642139],
    [0.0, 0.0, 1.2119675456389452],
  ];

  return multiply(M, XYZ);
}

// a98-rgb functions

function lin_a98rgb(RGB: Vector): Vector {
  // convert an array of a98-rgb values in the range 0.0 - 1.0
  // to linear light (un-companded) form.
  // negative values are also now accepted
  return RGB.map(function (val) {
    let sign = val < 0 ? -1 : 1;
    let abs = Math.abs(val);

    return sign * Math.pow(abs, 563 / 256);
  });
}

function gam_a98rgb(RGB: Vector): Vector {
  // convert an array of linear-light a98-rgb  in the range 0.0-1.0
  // to gamma corrected form
  // negative values are also now accepted
  return RGB.map(function (val) {
    let sign = val < 0 ? -1 : 1;
    let abs = Math.abs(val);

    return sign * Math.pow(abs, 256 / 563);
  });
}

function lin_a98rgb_to_XYZ(rgb: Vector): Vector {
  // convert an array of linear-light a98-rgb values to CIE XYZ
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  // has greater numerical precision than section 4.3.5.3 of
  // https://www.adobe.com/digitalimag/pdfs/AdobeRGB1998.pdf
  // but the values below were calculated from first principles
  // from the chromaticity coordinates of R G B W
  // see matrixmaker.html
  const M: Matrix = [
    [573536 / 994567, 263643 / 1420810, 187206 / 994567],
    [591459 / 1989134, 6239551 / 9945670, 374412 / 4972835],
    [53769 / 1989134, 351524 / 4972835, 4929758 / 4972835],
  ];

  return multiply(M, rgb);
}

function XYZ_to_lin_a98rgb(XYZ: Vector): Vector {
  // convert XYZ to linear-light a98-rgb
  const M: Matrix = [
    [1829569 / 896150, -506331 / 896150, -308931 / 896150],
    [-851781 / 878810, 1648619 / 878810, 36519 / 878810],
    [16779 / 1248040, -147721 / 1248040, 1266979 / 1248040],
  ];

  return multiply(M, XYZ);
}

//Rec. 2020-related functions

function lin_2020(RGB: Vector): Vector {
  // convert an array of rec2020 RGB values in the range 0.0 - 1.0
  // to linear light (un-companded) form.
  //  Reference electro-optical transfer function from Rec. ITU-R BT.1886 Annex 1
  //  with b (black lift) = 0 and a (user gain) = 1
  //  defined over the extended range, not clamped

  return RGB.map(function (val) {
    let sign = val < 0 ? -1 : 1;
    let abs = Math.abs(val);
    return sign * Math.pow(abs, 2.4);
  });
}

function gam_2020(RGB: Vector): Vector {
  // convert an array of linear-light rec2020 RGB  in the range 0.0-1.0
  // to gamma corrected form
  //  Reference electro-optical transfer function from Rec. ITU-R BT.1886 Annex 1
  //  with b (black lift) = 0 and a (user gain) = 1
  //  defined over the extended range, not clamped

  return RGB.map(function (val) {
    let sign = val < 0 ? -1 : 1;
    let abs = Math.abs(val);
    return sign * Math.pow(abs, 1 / 2.4);
  });
}

function lin_2020_to_XYZ(rgb: Vector): Vector {
  // convert an array of linear-light rec2020 values to CIE XYZ
  // using  D65 (no chromatic adaptation)
  const M: Matrix = [
    [63426534 / 99577255, 20160776 / 139408157, 47086771 / 278816314],
    [26158966 / 99577255, 472592308 / 697040785, 8267143 / 139408157],
    [0 / 1, 19567812 / 697040785, 295819943 / 278816314],
  ];
  // 0 is actually calculated as  4.994106574466076e-17

  return multiply(M, rgb);
}

function XYZ_to_lin_2020(XYZ: Vector): Vector {
  // convert XYZ to linear-light rec2020
  const M: Matrix = [
    [30757411 / 17917100, -6372589 / 17917100, -4539589 / 17917100],
    [-19765991 / 29648200, 47925759 / 29648200, 467509 / 29648200],
    [792561 / 44930125, -1921689 / 44930125, 42328811 / 44930125],
  ];

  return multiply(M, XYZ);
}

// Chromatic adaptation

// Bradford chromatic adaptation from D65 to D50
// The matrix below is the result of three operations:
// - convert from XYZ to retinal cone domain
// - scale components from one reference white to another
// - convert back to XYZ
// see https://github.com/LeaVerou/color.js/pull/354/files

const D65_to_D50: Matrix = [
  [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
  [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
  [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
];

// Bradford chromatic adaptation from D50 to D65
// See https://github.com/LeaVerou/color.js/pull/360/files
const D50_to_D65: Matrix = [
  [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
  [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
  [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
];

// CIE Lab and LCH

function XYZ_to_Lab(XYZ: Vector): Vector {
  // Assuming XYZ is relative to D50, convert to CIE Lab
  // from CIE standard, which now defines these as a rational fraction
  const epsilon = 216 / 24389; // 6^3/29^3
  const kappa = 24389 / 27; // 29^3/3^3

  // compute xyz, which is XYZ scaled relative to reference white
  const xyz = XYZ.map((value, i) => value / whitepoints.D50[i]);

  // now compute f
  const f = xyz.map((value) =>
    value > epsilon ? Math.cbrt(value) : (kappa * value + 16) / 116,
  );

  return [
    116 * f[1] - 16, // L
    500 * (f[0] - f[1]), // a
    200 * (f[1] - f[2]), // b
  ];
  // L in range [0,100]. For use in CSS, add a percent
}

function Lab_to_XYZ(Lab: Vector): Vector {
  // Convert Lab to D50-adapted XYZ
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  const kappa = 24389 / 27; // 29^3/3^3
  const epsilon = 216 / 24389; // 6^3/29^3
  const f = [];

  // compute f, starting with the luminance-related term
  f[1] = (Lab[0] + 16) / 116;
  f[0] = Lab[1] / 500 + f[1];
  f[2] = f[1] - Lab[2] / 200;

  // compute xyz
  const xyz = [
    Math.pow(f[0], 3) > epsilon ? Math.pow(f[0], 3) : (116 * f[0] - 16) / kappa,
    Lab[0] > kappa * epsilon
      ? Math.pow((Lab[0] + 16) / 116, 3)
      : Lab[0] / kappa,
    Math.pow(f[2], 3) > epsilon ? Math.pow(f[2], 3) : (116 * f[2] - 16) / kappa,
  ];

  // Compute XYZ by scaling xyz by reference white
  return xyz.map((value, i) => value * whitepoints.D50[i]);
}

function Lab_to_LCH(Lab: Vector): Vector {
  const epsilon = 0.0015;
  const chroma = Math.sqrt(Math.pow(Lab[1], 2) + Math.pow(Lab[2], 2)); // Chroma
  let hue = (Math.atan2(Lab[2], Lab[1]) * 180) / Math.PI;

  if (hue < 0) {
    hue = hue + 360;
  }

  if (chroma <= epsilon) {
    hue = NaN;
  }

  return [
    Lab[0], // L is still L
    chroma, // Chroma
    hue, // Hue, in degrees [0 to 360)
  ];
}

function LCH_to_Lab(LCH: Vector): Vector {
  // Convert from polar form
  return [
    LCH[0], // L is still L
    LCH[1] * Math.cos((LCH[2] * Math.PI) / 180), // a
    LCH[1] * Math.sin((LCH[2] * Math.PI) / 180), // b
  ];
}

// OKLab and OKLCH
// https://bottosson.github.io/posts/oklab/

// XYZ <-> LMS matrices recalculated for consistent reference white
// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484
// recalculated for 64bit precision
// see https://github.com/color-js/color.js/pull/357

function XYZ_to_OKLab(XYZ: Vector): Vector {
  // Given XYZ relative to D65, convert to OKLab
  const XYZtoLMS: Matrix = [
    [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
    [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
    [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
  ];
  const LMStoOKLab: Matrix = [
    [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
    [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
    [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
  ];

  const LMS = multiply(XYZtoLMS, XYZ);
  // JavaScript Math.cbrt returns a sign-matched cube root
  // beware if porting to other languages
  // especially if tempted to use a general power function

  return multiply(
    LMStoOKLab,
    LMS.map((c) => Math.cbrt(c)),
  );
  // L in range [0,1]. For use in CSS, multiply by 100 and add a percent
}

function OKLab_to_XYZ(OKLab: Vector): Vector {
  // Given OKLab, convert to XYZ relative to D65
  const LMStoXYZ: Matrix = [
    [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
    [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
    [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
  ];
  const OKLabtoLMS = [
    [1.0, 0.3963377773761749, 0.2158037573099136],
    [1.0, -0.1055613458156586, -0.0638541728258133],
    [1.0, -0.0894841775298119, -1.2914855480194092],
  ];

  const LMSnl = multiply(OKLabtoLMS, OKLab);
  return multiply(
    LMStoXYZ,
    LMSnl.map((c) => c ** 3),
  );
}

function OKLab_to_OKLCH(OKLab: Vector): Vector {
  const epsilon = 0.000004;
  let hue = (Math.atan2(OKLab[2], OKLab[1]) * 180) / Math.PI;
  const chroma = Math.sqrt(OKLab[1] ** 2 + OKLab[2] ** 2);

  if (hue < 0) {
    hue = hue + 360;
  }

  if (chroma <= epsilon) {
    hue = NaN;
  }

  return [
    OKLab[0], // L is still L
    chroma,
    hue,
  ];
}

function OKLCH_to_OKLab(OKLCH: Vector): Vector {
  return [
    OKLCH[0], // L is still L
    OKLCH[1] * Math.cos((OKLCH[2] * Math.PI) / 180), // a
    OKLCH[1] * Math.sin((OKLCH[2] * Math.PI) / 180), // b
  ];
}

/**
 * Return the first column of a matrix as a vector.
 */
function toVector(M: Matrix): Vector {
  return M.map((row) => row[0]);
}

/**
 * Multiply a matrix by a vector.
 */
function multiply(M: Matrix, v: Vector): Vector {
  return toVector(Matrix.multiply(M, v));
}
