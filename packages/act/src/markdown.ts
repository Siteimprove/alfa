import { Rule, Target, Aspect, Outcome, Locale } from "@alfa/rule";

export function markdown<T extends Target, A extends Aspect>(
  rule: Rule<T, A>,
  lang: Locale["id"]
): string | null {
  const locale = rule.locales.find(locale => locale.id === lang);

  if (!locale) {
    return null;
  }

  const lines: Array<string> = [];

  lines.push(`# ${locale.title}\n`);
  lines.push(`> ${rule.id}\n`);
  lines.push(`${locale.description}\n`);

  lines.push("## Tests\n");

  for (const [index, test] of locale.expectations.entries()) {
    lines.push(`### Test ${index + 1}\n`);
    lines.push(`${test.description}\n`);

    lines.push("#### Result\n");
    lines.push("Outcome | Description");
    lines.push("--- | ---");

    for (const outcome of ["inapplicable", "passed", "failed"]) {
      const description = test.outcome[outcome as Outcome];

      if (description) {
        lines.push(`${outcome} | ${description}`);
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}
