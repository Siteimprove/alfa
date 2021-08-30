const path = require("path");

const { Extractor, ExtractorConfig } = require("@microsoft/api-extractor");

const { system } = require("./system");

exports.documenter = {
  document(root = "packages") {
    const projects = system
      .readDirectory(root, ["tsconfig.json"], ["node_modules"])
      .map(path.dirname);

    let code = 0;

    for (const project of projects) {
      let file;
      try {
        file = require.resolve(path.resolve(project, "config", "api.json"));
      } catch {
        continue;
      }

      const config = ExtractorConfig.loadFileAndPrepare(file);

      try {
        const result = Extractor.invoke(config, {
          localBuild: process.env.CI !== "true",
          messageCallback: (message) => {
            // Don't output information messages.
            if (message.logLevel === "info") {
              message.handled = true;
            }
          },
        });

        if (!result.succeeded) {
          code = 1;
        }
      } catch (err) {
        console.error(err.message);
        code = 1;
      }
    }

    return code;
  },
};
