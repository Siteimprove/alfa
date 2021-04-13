const Linter = require("eslint").ESLint;

const { system } = require("./system");
const { flags } = require("./flags");

const linter = new Linter({ useEslintrc: true });

exports.linter = {
  async lint(root = "packages") {
    const formatter = await linter.loadFormatter(
      flags.pretty ? "stylish" : "visualstudio"
    );

    const results = await linter.lintFiles(
      system
        .readDirectory(root, [".ts", ".tsx"])
        .filter((fileName) => !fileName.endsWith(".d.ts"))
    );

    system.write(formatter.format(results));

    return results.every((result) => result.errorCount === 0) ? 0 : 1;
  },
};
