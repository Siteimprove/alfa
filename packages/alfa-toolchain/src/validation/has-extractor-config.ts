import * as fs from "fs";
import * as path from "path";

export function hasExtractorConfig(dir: string, error: number) {
  const configDir = path.join(dir, "config");

  if (!fs.existsSync(configDir)) {
    console.error(`${configDir} does not exist`);
    process.exit(error);
  }

  const configFile = path.join(configDir, "api-extractor.json");

  if (!fs.existsSync(configFile)) {
    console.error(`${configFile} does not exist`);
    process.exit(error);
  }
}
