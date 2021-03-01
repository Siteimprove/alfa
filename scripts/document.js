const { system } = require("./common/system");
const { flags } = require("./common/flags");
const { builder } = require("./common/builder");
const { documenter } = require("./common/documenter");

const status = builder.build(flags.project);

if (status !== 0) {
  system.exit(status);
}

system.exit(documenter.document(flags.project));
