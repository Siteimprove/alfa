const { system } = require("./common/system");
const { flags } = require("./common/flags");
const { builder } = require("./common/builder");
const { tester } = require("./common/tester");

const status = builder.build(flags.project);

if (status !== 0) {
  system.exit(status);
}

tester.test(flags.project);
