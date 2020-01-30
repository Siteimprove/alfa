const Linter = require("eslint").CLIEngine;

const { system } = require("./system");
const { flags } = require("./flags");

const linter = new Linter({ useEslintrc: true });

const formatter = Linter.getFormatter(
  flags.pretty ? "stylish" : "visualstudio"
);

exports.linter = {
  lint(root = "packages") {
    const { results, errorCount } = linter.executeOnFiles(
      system
        .readDirectory(root, [".ts", ".tsx"])
        .filter(fileName => !fileName.endsWith(".d.ts"))
    );

    if (results.length !== 0) {
      system.write(formatter(results) + "\n");
    }

    return errorCount === 0 ? 0 : 1;
  }
};
