import * as path from "path";

import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { system } from "./common/system.mjs";
import { flags } from "./common/flags.mjs";
import { builder } from "./common/builder.mjs";

const status = builder.build(flags.project);

if (status !== 0) {
  system.exit(status);
}

system.exit(extract(flags.project));

function extract(root = "packages") {
  const exclude = ["packages", "scratches"];
  const projects = system
    .readDirectory(root, ["tsconfig.json"], ["node_modules"])
    .map(path.dirname)
    .filter((x) => !exclude.includes(x));

  let code = 0;

  for (const project of projects) {
    const filePath = path.resolve(project, "config", "api-extractor.json");

    const config = ExtractorConfig.loadFileAndPrepare(filePath);

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

  return code;
}
