import { AssertionError } from "assert";
import chalk from "chalk";
import * as stack from "error-stack-parser";
import * as path from "path";

/**
 * @internal
 */
export function format(name: string, error: Error & AssertionError): string {
  const message = error.generatedMessage ? "" : `\n${error.message}\n`;

  const [{ fileName, lineNumber }] = stack.parse(error);

  const filePath =
    fileName === undefined ? "unknown" : path.relative(process.cwd(), fileName);

  error = new AssertionError({
    actual: error.actual,
    expected: error.expected,
    operator: error.operator
  });

  const difference = error.message
    .split("\n")
    .slice(1)
    .join("\n");

  const output = `
${chalk.bold(name)}
${chalk.dim(`${filePath}:${lineNumber}`)}
${message}
${difference}
  `;

  return `\n${output.trim()}\n`;
}
