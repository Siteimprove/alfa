const { system } = require("./common/system");
const { flags } = require("./common/flags");
const { builder } = require("./common/builder");

system.exit(builder.build(flags.project));
