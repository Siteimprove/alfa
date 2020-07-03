const { system } = require("./common/system");
const { flags } = require("./common/flags");
const { documenter } = require("./common/documenter");

system.exit(documenter.document(flags.project));
