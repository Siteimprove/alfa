import * as path from "path";
import { AssertionError } from "assert";
import chalk from "chalk";

const Stack = require("error-stack-parser");
const { diff } = require("concordance");
const { theme } = require("concordance-theme-ava");

/**
 * @internal
 */
export function format(name: string, error: AssertionError): string {
  const [{ fileName, lineNumber }] = Stack.parse(error);

  const filePath = path.relative(process.cwd(), fileName);

  const message = `
${chalk.bold(name)}
${chalk.gray(`${filePath}:${lineNumber}`)}

Difference:

${diff(error.actual, error.expected, { theme })}`;

  return message;
}
