const ansiStyles = require("ansi-styles");
const chalk = require("chalk");

const theme = {
  boolean: ansiStyles.yellow,
  circular: chalk.grey("[Circular]"),
  date: {
    invalid: chalk.red("invalid"),
    value: ansiStyles.blue
  },
  diffGutters: {
    actual: chalk.red("-") + " ",
    expected: chalk.green("+") + " ",
    padding: "  "
  },
  error: {
    ctor: {
      open: ansiStyles.grey.open + "(",
      close: ")" + ansiStyles.grey.close
    },
    name: ansiStyles.magenta
  },
  function: {
    name: ansiStyles.blue,
    stringTag: ansiStyles.magenta
  },
  global: ansiStyles.magenta,
  item: { after: chalk.grey(",") },
  list: { openBracket: chalk.grey("["), closeBracket: chalk.grey("]") },
  mapEntry: { after: chalk.grey(",") },
  maxDepth: chalk.grey("…"),
  null: ansiStyles.yellow,
  number: ansiStyles.yellow,
  object: {
    openBracket: chalk.grey("{"),
    closeBracket: chalk.grey("}"),
    ctor: ansiStyles.magenta,
    stringTag: {
      open: ansiStyles.magenta.open + "@",
      close: ansiStyles.magenta.close
    },
    secondaryStringTag: {
      open: ansiStyles.grey.open + "@",
      close: ansiStyles.grey.close
    }
  },
  property: {
    after: chalk.grey(","),
    keyBracket: { open: chalk.grey("["), close: chalk.grey("]") },
    valueFallback: chalk.grey("…")
  },
  regexp: {
    source: {
      open: ansiStyles.blue.open + "/",
      close: "/" + ansiStyles.blue.close
    },
    flags: ansiStyles.yellow
  },
  stats: { separator: chalk.grey("---") },
  string: {
    open: ansiStyles.blue.open,
    close: ansiStyles.blue.close,
    line: { open: chalk.blue("'"), close: chalk.blue("'") },
    multiline: { start: chalk.blue("`"), end: chalk.blue("`") },
    controlPicture: ansiStyles.grey,
    diff: {
      insert: {
        open: ansiStyles.bgGreen.open + ansiStyles.black.open,
        close: ansiStyles.black.close + ansiStyles.bgGreen.close
      },
      delete: {
        open: ansiStyles.bgRed.open + ansiStyles.black.open,
        close: ansiStyles.black.close + ansiStyles.bgRed.close
      },
      equal: ansiStyles.blue,
      insertLine: {
        open: ansiStyles.green.open,
        close: ansiStyles.green.close
      },
      deleteLine: {
        open: ansiStyles.red.open,
        close: ansiStyles.red.close
      }
    }
  },
  symbol: ansiStyles.yellow,
  typedArray: {
    bytes: ansiStyles.yellow
  },
  undefined: ansiStyles.yellow
};

module.exports = { theme };
