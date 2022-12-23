/// <reference types="node" />

import { Rule, Oracle } from "@siteimprove/alfa-act";
import { Hashable } from "@siteimprove/alfa-hash";
import { Result, Err } from "@siteimprove/alfa-result";

/**
 * @public
 */
export type Interviewer<I, T extends Hashable, Q = never, S = T> = (
  input: I,
  rules: Iterable<Rule<I, T, Q, S>>
) => Oracle<I, T, Q, S>;

/**
 * @public
 */
export namespace Interviewer {
  export async function load<I, T extends Hashable, Q = never, S = T>(
    name: string,
    defaultScope: string = "@siteimprove"
  ): Promise<Result<Interviewer<I, T, Q, S>, string>> {
    let scope: string | undefined;

    if (name.startsWith("@")) {
      const match = name.match(/^(@[^/]+)\/(.+)$/);

      if (match !== null) {
        scope = match[1];
        name = match[2];
      }
    }

    const patterns: Array<string> = [...candidates(name, scope)];

    if (scope === undefined) {
      patterns.push(...candidates(name, defaultScope));

      // For unscoped names, also attempt resolving the name as a file path to
      // allow loading local modules. This is only supported in Node.js and so
      // we lazily attempt importing the "path" module.
      try {
        const path = await import("path");

        patterns.push(path.resolve(name));
      } catch {}
    }

    for (const pattern of patterns) {
      try {
        const module = await import(pattern);

        return Result.of(module.default());
      } catch {
        continue;
      }
    }

    return Err.of(
      `No interviewer named "${name}" was found at:\n\n${patterns
        .map((pattern) => "  " + pattern)
        .join("\n")}`
    );
  }
}

const prefix = "alfa-interviewer-";

function* candidates(name: string, scope?: string): Iterable<string> {
  scope = scope === undefined ? "" : scope + "/";

  if (!name.startsWith(prefix)) {
    yield scope + prefix + name;
  }

  yield scope + name;
}
