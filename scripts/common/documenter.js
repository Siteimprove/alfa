const path = require("path");

const { Extractor, ExtractorConfig } = require("@microsoft/api-extractor");

const { system } = require("./system");

exports.documenter = {
  document(root = "packages") {
    const projects = system
      .readDirectory(root, ["tsconfig.json"], ["node_modules"])
      .map(path.dirname);

    let code = 0;
    // BEGIN error catching to remove
    let apiExtractorXpathErrorCaught = false;
    let xpathSeen = false;
    let apiExtractorCalculationErrorCaught = false;
    let calculationSeen = false;
    // END error catching to remove

    for (const project of projects) {
      // BEGIN error catching to remove
      xpathSeen = xpathSeen || project.includes("alfa-xpath");
      calculationSeen = calculationSeen || project.includes("alfa-css");
      // END error catching to remove
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

            // BEGIN error catching to remove
            // https://github.com/microsoft/rushstack/issues/3486#issuecomment-1197988205
            if (
              project.includes("alfa-css") &&
              message.logLevel === "warning" &&
              message.text.includes("Calculation<out, D>")
            ) {
              message.handled = true;
            }
            // END error catching to remove
          },
        });

        if (!result.succeeded) {
          code = 1;
        }
      } catch (err) {
        // BEGIN error catching to clean (remove if, keep else branch)
        // https://github.com/microsoft/rushstack/issues/3486
        if (
          project.includes("alfa-xpath") &&
          err.message.includes('Internal Error: Unable to follow symbol for ""')
        ) {
          apiExtractorXpathErrorCaught = true;
        } else {
          console.error(err.message);
          code = 1;
        }
        // END error catching to clean (remove if, keep else branch)
      }
    }

    // BEGIN error catching to remove
    if (
      (xpathSeen && !apiExtractorXpathErrorCaught) ||
      (calculationSeen && !apiExtractorCalculationErrorCaught)
    ) {
      console.error(
        "API extractor may have upgrade to TS 4.7\nInvestigate and clean `scripts/common/documenter.js`"
      );
      code = 2;
    }
    // END error catching to remove

    return code;
  },
};
