const { system } = require("./common/system");
const { flags } = require("./common/flags");
const { linter } = require("./common/linter");

linter.lint(flags.project).then((code) => system.exit(code));
