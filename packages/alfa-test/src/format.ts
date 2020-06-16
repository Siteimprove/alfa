/// <reference types="node" />

import * as assert from "assert";
import * as path from "path";

import { mark } from "@siteimprove/alfa-highlight";

import { stack } from "./stack";

/**
 * @internal
 */
export function format(name: string, error: Error): string {
  const [callsite] = stack(error);

  const [file, line, column] =
    callsite.type === "native"
      ? ["native", -1, -1]
      : [
          path.relative(process.cwd(), callsite.file),
          callsite.line,
          callsite.column,
        ];

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
${mark.underline(`${file}(${line},${column}):`)} ${mark.bold(
    name.trim().replace(/\s+/g, " ")
  )}
${message}
  `;

  return `${output.trim()}\n`;
}
