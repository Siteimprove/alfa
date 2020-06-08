/// <reference types="node" />

import { Outcome } from "@siteimprove/alfa-act";
import { Result, Ok, Err } from "@siteimprove/alfa-result";

export type Formatter<I, T, Q> = (
  input: I,
  outcomes: Iterable<Outcome<I, T, Q>>
) => string;

export namespace Formatter {
  export function load<I, T, Q>(
    name: string,
    defaultScope: string = "@siteimprove"
  ): Result<Formatter<I, T, Q>, string> {
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
    }

    for (const pattern of patterns) {
      try {
        return Ok.of(require(pattern).default());
      } catch {
        continue;
      }
    }

    return Err.of(
      `No formatter named "${name}" was found at:\n\n${patterns
        .map((pattern) => "  " + pattern)
        .join("\n")}`
    );
  }
}

const prefix = "alfa-formatter-";

function* candidates(name: string, scope?: string): Iterable<string> {
  scope = scope === undefined ? "" : scope + "/";

  if (!name.startsWith(prefix)) {
    yield scope + prefix + name;
  }

  yield scope + name;
}
