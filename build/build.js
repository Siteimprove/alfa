// @ts-check

const path = require("path");
const signale = require("signale");
const chalk = require("chalk");

const { writeFile, findFiles } = require("./helpers/file-system");
const { withExtension } = require("./helpers/path");
const { packages } = require("./helpers/meta");
const { Workspace } = require("./helpers/workspace");
const { formatDiagnostic } = require("./helpers/diagnostics");

const workspace = new Workspace();

for (const pkg of packages) {
  const files = findFiles(`packages/${pkg}`, withExtension(".ts", ".tsx"));

  for (const file of files) {
    const diagnostics = workspace.diagnose(file);

    if (diagnostics.length > 0) {
      for (const diagnostic of diagnostics) {
        signale.fatal(formatDiagnostic(diagnostic));
      }

      process.exit(1);
    } else {
      const compiled = workspace.compile(file);

      for (const { name, text } of compiled) {
        writeFile(name, text);
      }

      signale.success(chalk.dim(path.relative(process.cwd(), file)));
    }
  }
}
