import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Future } from "@siteimprove/alfa-future";
import { Hashable } from "@siteimprove/alfa-hash";
import { Result, Err } from "@siteimprove/alfa-result";

/**
 * @public
 */
export type Formatter<I, T extends Hashable, Q = never, S = T> = (
  input: I,
  rules: Iterable<Rule<I, T, Q, S>>,
  outcomes: Iterable<Outcome<I, T, Q, S>>
) => Future.Maybe<string>;

/**
 * @public
 */
export namespace Formatter {
  export async function load<I, T extends Hashable, Q = never, S = T>(
    name: string,
    defaultScope: string = "@siteimprove"
  ): Promise<Result<Formatter<I, T, Q, S>, string>> {
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
        const module = await import(pattern);

        return Result.of(module.default());
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
