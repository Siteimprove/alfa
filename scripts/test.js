const { flags } = require("./common/flags");
const { builder } = require("./common/builder");
const { tester } = require("./common/tester");

builder.build(flags.project);
tester.test(flags.project);
