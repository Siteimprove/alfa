/// <reference types="node" />

import { Outcome } from "@siteimprove/alfa-act";
import { Formatter } from "@siteimprove/alfa-formatter";
import { Future } from "@siteimprove/alfa-future";
import { Mapper } from "@siteimprove/alfa-mapper";

import earl from "@siteimprove/alfa-formatter-earl";

export interface Handler<I, T, Q> {
  (
    input: I,
    outcomes: Iterable<Outcome<I, T, Q>>,
    message: string
  ): Future.Maybe<string>;
}

export namespace Handler {
  /**
   * Construct a handler that will write audit outcomes to disk.
   *
   * @remarks
   * This handler is only compatible with Node.js.
   *
   * @param output - A function mapping an input to the path at which audit
   * outcomes should be written.
   * @param format - The format to use for outputting audit outcomes. If not
   * provided, EARL will be used.
   */
  export function persist<I, T, Q>(
    output: Mapper<I, string>,
    format: Formatter<I, T, Q> = earl()
  ): Handler<I, T, Q> {
    return (input, outcomes, message) =>
      Future.from(async () => {
        // Only attempt to load the needed Node.js modules when the handler is
        // run to ensure that we don't break things if run in non-Node.js
        // environments.
        const fs = await import("fs");
        const path = await import("path");

        const file = path.relative(process.cwd(), output(input));
        const dir = path.dirname(file);

        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(file, format(input, outcomes) + "\n");

        return `${message}, see the full report at ${file}`;
      });
  }
}
