const { packages } = require("./helpers/meta");
const { writeFile } = require("./helpers/file-system");
const notify = require("./helpers/notify");

const { sync } = require("./tasks/sync");

for (const pkg of packages) {
  const manifest = require(`../packages/${pkg}/package.json`);

  writeFile(`packages/${pkg}/package.json`, sync(manifest));

  notify.success(manifest.name);
}
