const fs = require("fs");
const path = require("path");
const { system } = require("./system");

const { Extractor, ExtractorConfig } = require("@microsoft/api-extractor");
const { ApiModel } = require("@microsoft/api-extractor-model");
const {
  MarkdownDocumenter,
} = require("@microsoft/api-documenter/lib/documenters/MarkdownDocumenter");

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
        code = 2;
      }
    }

    // Only generate documentation if no error yet, and not running in CI.
    if (code === 0 && process.env.CI !== true) {
      try {
        const apiModel = new ApiModel();

        // We need to load all API model (JSON) files, since the documenter needs
        // an overview of all the packages.
        // Ideally, we should locate these via the API config, not hard coding the
        // relative path.
        const modelDir = path.join(
          __dirname,
          "..",
          "..",
          "docs",
          "data",
          "api"
        );
        const outputFolder = path.join(__dirname, "..", "..", "docs", "api");

        fs.readdirSync(modelDir)
          .filter((file) => file.endsWith(".api.json"))
          .forEach((file) => apiModel.loadPackage(path.join(modelDir, file)));

        const documenter = new MarkdownDocumenter({
          apiModel,
          outputFolder,
          documenterConfig: undefined,
        });

        documenter.generateFiles();
      } catch (err) {
        console.error(err.message);
        code = 3;
      }
    }

    return code;
  },
};
