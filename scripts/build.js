const process = require("process");

const { flags } = require("./common/flags");
const { builder } = require("./common/builder");

process.exit(builder.build(flags.project));
