// This file has been automatically generated based on the MDN browser
// compatibility data. Do therefore not modify it directly! If you wish to make
// changes, do so in `build/features.js` and run `yarn prepare` to rebuild this
// file.

import { Feature } from "./types";

/**
 * Names of browser features for which we have compatibility data. These names
 * correspond to a path to a browser feature in the MDN browser compatibility
 * data.
 *
 * @see https://github.com/mdn/browser-compat-data#usage
 */
export type FeatureName =
  | "css.properties.border-radius"
  | "css.properties.border-radius.elliptical_borders"
  | "css.properties.border-radius.4_values_for_4_corners"
  | "css.properties.border-radius.percentages"
  | "css.properties.color"
  | "css.properties.color.keyword_color_values"
  | "css.properties.color.rgb_hexadecimal_notation"
  | "css.properties.color.rgb_functional_notation"
  | "css.properties.color.hsl"
  | "css.properties.color.alpha"
  | "css.properties.color.currentcolor"
  | "css.properties.color.transparent"
  | "css.properties.color.rebeccapurple"
  | "css.properties.color.alpha_hexadecimal_notation"
  | "css.properties.color.space_separated_functional_notation"
  | "css.properties.color.floats_in_rgb_rgba"
  | "css.properties.font-weight"
  | "css.properties.font-weight.number";

/**
 * @internal
 */
export const Features: { [P in FeatureName]: Feature } = {
  "css.properties.border-radius": {
    support: {
      chrome: {
        added: "4"
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: "4"
      },
      ie: {
        added: "9"
      },
      opera: {
        added: "10.5"
      },
      safari: {
        added: "5"
      }
    }
  },
  "css.properties.border-radius.elliptical_borders": {
    support: {
      chrome: {
        added: true
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: "3.5"
      },
      ie: {
        added: true
      },
      opera: {
        added: true
      },
      safari: {
        added: true
      }
    }
  },
  "css.properties.border-radius.4_values_for_4_corners": {
    support: {
      chrome: {
        added: "4"
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: true
      },
      ie: {
        added: true
      },
      opera: {
        added: true
      },
      safari: {
        added: "5"
      }
    }
  },
  "css.properties.border-radius.percentages": {
    support: {
      chrome: {
        added: true
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: "4"
      },
      ie: {
        added: true
      },
      opera: {
        added: "11.5"
      },
      safari: {
        added: "5.1"
      }
    }
  },
  "css.properties.color": {
    support: {
      chrome: {
        added: "1"
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: "1"
      },
      ie: {
        added: true
      },
      opera: {
        added: true
      },
      safari: {
        added: true
      }
    }
  },
  "css.properties.color.keyword_color_values": {
    support: {
      chrome: {
        added: "1"
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: "1"
      },
      ie: {
        added: "3"
      },
      opera: {
        added: "3.5"
      },
      safari: {
        added: "1"
      }
    }
  },
  "css.properties.color.rgb_hexadecimal_notation": {
    support: {
      chrome: {
        added: "1"
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: "1"
      },
      ie: {
        added: "3"
      },
      opera: {
        added: "3.5"
      },
      safari: {
        added: "1"
      }
    }
  },
  "css.properties.color.rgb_functional_notation": {
    support: {
      chrome: {
        added: "1"
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: "1"
      },
      ie: {
        added: "4"
      },
      opera: {
        added: "3.5"
      },
      safari: {
        added: "1"
      }
    }
  },
  "css.properties.color.hsl": {
    support: {
      chrome: {
        added: "1"
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: "1"
      },
      ie: {
        added: "9"
      },
      opera: {
        added: "9.5"
      },
      safari: {
        added: "3.1"
      }
    }
  },
  "css.properties.color.alpha": {
    support: {
      chrome: {
        added: "1"
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: "3"
      },
      ie: {
        added: "9"
      },
      opera: {
        added: "10"
      },
      safari: {
        added: "3.1"
      }
    }
  },
  "css.properties.color.currentcolor": {
    support: {
      chrome: {
        added: "1"
      },
      firefox: {
        added: "1.5"
      },
      ie: {
        added: "9"
      },
      opera: {
        added: "9.5"
      },
      safari: {
        added: "4"
      }
    }
  },
  "css.properties.color.transparent": {
    support: {
      chrome: {
        added: "1"
      },
      firefox: {
        added: "3"
      },
      ie: {
        added: "9"
      },
      opera: {
        added: "10"
      },
      safari: {
        added: "3.1"
      }
    }
  },
  "css.properties.color.rebeccapurple": {
    support: {
      chrome: {
        added: "38"
      },
      firefox: {
        added: "33"
      },
      ie: {
        added: "11"
      },
      opera: {
        added: "25"
      },
      safari: {
        added: true
      }
    }
  },
  "css.properties.color.alpha_hexadecimal_notation": {
    support: {
      chrome: {
        added: "63"
      },
      firefox: {
        added: "49"
      },
      safari: {
        added: "9.1"
      }
    }
  },
  "css.properties.color.space_separated_functional_notation": {
    support: {
      chrome: {
        added: "65"
      },
      firefox: {
        added: "52"
      },
      opera: {
        added: "52"
      }
    }
  },
  "css.properties.color.floats_in_rgb_rgba": {
    support: {
      chrome: {
        added: "66"
      },
      firefox: {
        added: "52"
      },
      opera: {
        added: "53"
      }
    }
  },
  "css.properties.font-weight": {
    support: {
      chrome: {
        added: "2"
      },
      edge: {
        added: "12"
      },
      firefox: {
        added: "1"
      },
      ie: {
        added: "3"
      },
      opera: {
        added: "3.5"
      },
      safari: {
        added: "1.3"
      }
    }
  },
  "css.properties.font-weight.number": {
    support: {
      firefox: {
        added: "61"
      }
    }
  }
};
