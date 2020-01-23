const { flags } = require("./common/flags");
const { watcher } = require("./common/watcher");

watcher.build(flags.project);
