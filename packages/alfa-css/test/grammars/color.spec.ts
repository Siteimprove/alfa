import { setSupportedBrowsers } from "@siteimprove/alfa-compatibility";
import { lex, parse } from "@siteimprove/alfa-lang";
import { Assertions, test } from "@siteimprove/alfa-test";
import { Alphabet } from "../../src/alphabet";
import { ColorGrammar } from "../../src/grammars/color";
import { Color } from "../../src/properties/color";

function color(t: Assertions, input: string, expected: Color) {
  t.deepEqual(parse(lex(input, Alphabet), ColorGrammar), expected, input);
}

test("Can parse a named color", t => {
  color(t, "red", {
    red: 255,
    green: 0,
    blue: 0,
    alpha: 1
  });
});

test("Can parse an RGB color", t => {
  color(t, "rgb(0, 50%, 100)", {
    red: 0,
    green: 127.5,
    blue: 100,
    alpha: 1
  });
});

test("Can parse an RGBA color", t => {
  setSupportedBrowsers("firefox > 48, chrome > 61", () => {
    color(t, "rgba(0, 50%, 100, 0.5)", {
      red: 0,
      green: 127.5,
      blue: 100,
      alpha: 0.5
    });
  });
  setSupportedBrowsers("ie 8, firefox 52", () => {
    color(t, "rgba(0, 50%, 100, 0.5)", {
      red: 0,
      green: 0,
      blue: 0,
      alpha: 0
    });
  });
});

test("Can parse an HSL color", t => {
  setSupportedBrowsers("firefox > 48, chrome > 61", () => {
    color(t, "hsl(225, 55%, 26%)", {
      red: 30,
      green: 48,
      blue: 103,
      alpha: 1
    });
  });
  setSupportedBrowsers("ie 8, firefox 52", () => {
    color(t, "hsl(225, 55%, 26%)", {
      red: 0,
      green: 0,
      blue: 0,
      alpha: 0
    });
  });
});

test("Can parse an HSLA color", t => {
  color(t, "hsl(3, 55%, 26%, 0.5)", {
    red: 103,
    green: 33,
    blue: 30,
    alpha: 0.5
  });
});

test("Can parse an achromatic HSL color", t => {
  color(t, "hsl(23, 0%, 26%)", {
    red: 66,
    green: 66,
    blue: 66,
    alpha: 1
  });
});

test("Can not parse an HSLA color with wrong paramter type", t => {
  color(t, "hsl(23%, 0%, 26%, 1)", {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  });

  color(t, "hsl(23, 0, 26%, 1)", {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  });

  color(t, "hsl(23, 0%, 26, 1)", {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  });

  color(t, "hsla(23, 0%, 26%, 40%)", {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  });
});

test("Can not parse an HSLA color with wrong paramter size", t => {
  color(t, "hsla(23, 0%)", {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  });

  color(t, "hsla(23, 0%, 52%, 1, 50%)", {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  });
});

test("Can parse a short HEX color", t => {
  color(t, "#ABC", {
    red: 170,
    green: 187,
    blue: 204,
    alpha: 1
  });
});

test("Can parse a HEX color", t => {
  color(t, "#ABCDEF", {
    red: 171,
    green: 205,
    blue: 239,
    alpha: 1
  });
});

test("Can parse a medium-long HEX color in browsers that support it", t => {
  setSupportedBrowsers("firefox > 48, chrome > 61", () => {
    color(t, "#ABCD", {
      red: 170,
      green: 187,
      blue: 204,
      alpha: 0.8666666666666667
    });
  });
  setSupportedBrowsers("firefox > 48, ie > 6", () => {
    color(t, "#ABCD", {
      red: 0,
      green: 0,
      blue: 0,
      alpha: 0
    });
  });
});

test("Can parse a long HEX color", t => {
  setSupportedBrowsers("firefox > 48, chrome > 61", () => {
    color(t, "#ABCDEFCC", {
      red: 171,
      green: 205,
      blue: 239,
      alpha: 0.8
    });
  });
  setSupportedBrowsers("firefox > 48, ie > 6", () => {
    color(t, "#ABCDEFCC", {
      red: 0,
      green: 0,
      blue: 0,
      alpha: 0
    });
  });
});

test("Invalid hex colors fall back to transparent", t => {
  color(t, "#AB", {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  });
});

test("Parses transparent color", t => {
  color(t, "transparent", {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  });
});

test("Clamps values to their minimums", t => {
  color(t, "rgba(-20, -20, -20, -0.5)", {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0
  });
});

test("Clamps values to their maximums", t => {
  color(t, "rgba(300, 300, 300, 2)", {
    red: 255,
    green: 255,
    blue: 255,
    alpha: 1
  });
});
