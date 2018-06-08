const path = require("path")
const { findFiles } = require("./helpers/file-system");
const { packages } = require("./helpers/meta");
const { Workspace } = require("./helpers/workspace");

const workspace = new Workspace();

for (const pkg of packages) {
  const typescript = findFiles(`packages/${pkg}`, file => {
    switch (path.extname(file)) {
      case ".ts":
      case ".tsx":
        return true;
      default:
        return false;
    }
  });

  console.log(typescript);
}
