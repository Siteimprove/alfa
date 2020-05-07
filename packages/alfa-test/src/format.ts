/// <reference types="node" />

import * as assert from "assert";
import * as path from "path";

import * as stack from "error-stack-parser";

import { mark } from "@siteimprove/alfa-highlight";

/**
 * @internal
 */
export function format(name: string, error: Error): string {
  const [{ fileName, lineNumber, columnNumber }] = stack.parse(error);

  const filePath =
    fileName === undefined ? "unknown" : path.relative(process.cwd(), fileName);

  let message: string;

  if (error instanceof assert.AssertionError) {
    message = error.generatedMessage ? "" : `\n${error.message}\n`;

    error = new assert.AssertionError({
      actual: error.actual,
      expected: error.expected,
      operator: error.operator,
    });

    error.message =
      message +
      "\n" +
      error.message.replace(
        "Input A expected to strictly deep-equal input B:\n",
        ""
      );

    message += error.message;
  } else {
    message = error.stack ?? error.message;
  }

  const output = `
${mark.underline(`${filePath}(${lineNumber},${columnNumber}):`)} ${mark.bold(
    name.trim().replace(/\s+/g, " ")
  )}
${message}
  `;

  return `${output.trim()}\n`;
}
