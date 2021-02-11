const Linter = require("eslint").ESLint;

const { system } = require("./system");
const { flags } = require("./flags");

const linter = new Linter({ useEslintrc: true });

const formatter = linter.loadFormatter(
  flags.pretty ? "stylish" : "visualstudio"
);

exports.linter = {
  async lint(root = "packages") {
    const { results, errorCount } = await linter.lintFiles(
      system
        .readDirectory(root, [".ts", ".tsx"])
        .filter((fileName) => !fileName.endsWith(".d.ts"))
    );

    if (results.length !== 0) {
      system.write(formatter(results));
    }

    return errorCount === 0 ? 0 : 1;
  },
};
