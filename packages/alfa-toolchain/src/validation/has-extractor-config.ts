import * as fs from "fs";
import * as path from "path";

/**
 * Checks that a directory includes an API extractor config file.
 *
 * @remarks
 * `dir` is coming from @manypkg/get-packages, which sets it to the OS
 * specific syntax.
 */
export function hasExtractorConfig(dir: string): Array<string> {
  const errors: Array<string> = [];

  const configDir = path.join(dir, "config");
  if (!fs.existsSync(configDir)) {
    errors.push(`${configDir} does not exist.`);
  }

  const configFile = path.join(configDir, "api-extractor.json");
  if (!fs.existsSync(configFile)) {
    errors.push(`${configFile} does not exist.`);
  }

  return errors;
}
