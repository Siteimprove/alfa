const { system } = require("./common/system");
const { flags } = require("./common/flags");
const { builder } = require("./common/builder");
const { extractor } = require("./common/extractor");

const status = builder.build(flags.project);

if (status !== 0) {
  system.exit(status);
}

system.exit(extractor.extract(flags.project));
