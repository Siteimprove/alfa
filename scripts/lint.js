const { system } = require("./common/system");
const { flags } = require("./common/flags");
const { linter } = require("./common/linter");

system.exit(linter.lint(flags.project));
