const { system } = require("./common/system");
const { flags } = require("./common/flags");
const { builder } = require("./common/builder");
const { tester } = require("./common/tester");

// If testing a single rule, the project is actually alfa-rules
const project = flags.project.match(/^r\d$/)
  ? "packages/alfa-rules"
  : flags.project;

const status = builder.build(project);

if (status !== 0) {
  system.exit(status);
}

tester.test(flags.project);
