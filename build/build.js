const { packages } = require("./helpers/meta");
const { Workspace } = require("./helpers/workspace");

const workspace = new Workspace();

for (const pkg of packages) {
  console.log(pkg)
}
