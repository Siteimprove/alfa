const fs = require("fs");
const path = require("path");

const { ApiModel } = require("@microsoft/api-extractor-model");
const {
  MarkdownDocumenter,
} = require("@microsoft/api-documenter/lib/documenters/MarkdownDocumenter");
const {
  DocumenterConfig,
} = require("@microsoft/api-documenter/lib/documenters/DocumenterConfig");

const { system } = require("./common/system");
const { flags } = require("./common/flags");
const { builder } = require("./common/builder");

const status = builder.build(flags.project);

if (status !== 0) {
  system.exit(status);
}

system.exit(document(flags.project));

function document() {
  try {
    const apiModel = new ApiModel();

    // Ideally, we should locate these via the API config, not hard coding the
    // relative path.
    const modelDir = path.join(__dirname, "..", "docs", "data", "api");
    const outputFolder = path.join(__dirname, "..", "docs", "api");

    fs.readdirSync(modelDir)
      .filter((file) => file.endsWith(".api.json"))
      .forEach((file) => apiModel.loadPackage(path.join(modelDir, file)));

    const documenter = new MarkdownDocumenter({
      apiModel,
      outputFolder,
      documenterConfig: new DocumenterConfig(),
    });

    documenter.generateFiles();
  } catch (err) {
    console.error(err.message);
    code = 1;
  }

  return code;
}
