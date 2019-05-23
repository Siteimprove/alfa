/// <reference types="node" />

import { mark } from "@siteimprove/alfa-highlight";
import { AssertionError } from "assert";
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

  error.message = error.message.replace(
    "Input A expected to strictly deep-equal input B:\n",
    ""
  );

  const output = `
${mark.bold(name)}
${mark.underline(`${filePath}:${lineNumber}`)}
${message}
${error.message}
  `;

  return `\n${output.trim()}\n`;
}
