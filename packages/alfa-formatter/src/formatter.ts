import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Result, Err } from "@siteimprove/alfa-result";

export type Formatter<I = unknown, T = unknown, Q = never> = (
  input: I,
  rules: Iterable<Rule<I, T, Q>>,
  outcomes: Iterable<Outcome<I, T, Q>>
) => string;

export namespace Formatter {
  export async function load<I, T = unknown, Q = never>(
    name: string,
    defaultScope: string = "@siteimprove"
  ): Promise<Result<Formatter<I, T, Q>, string>> {
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
