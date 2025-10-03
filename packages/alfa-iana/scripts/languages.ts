/// <reference lib="dom" />

import * as fs from "node:fs";
import * as path from "node:path";
import * as prettier from "prettier";
import axios from "axios";

const registry = "https://www.iana.org/assignments/language-subtag-registry";

type Field = { name: string; value: string };

type Record = Array<Field>;

type Args = {
  scope?: string | null;
  prefix?: string | null;
  prefixes?: Array<string>;
};

interface Subtag {
  type: string;
  name: string;
  args: Args;
}

function getType(subtag: Subtag): string | null {
  switch (subtag.type) {
    case "language":
      return "primary";
    case "extlang":
      return "extended";
    case "script":
    case "region":
    case "variant":
      return subtag.type;
  }

  return null;
}

function range(from: string, to: string): Array<string> {
  const start = from.charCodeAt(0);
  const end = to.charCodeAt(0);

  const result: Array<string> = [];

  for (let i = start; i <= end; i++) {
    result.push(String.fromCharCode(i));
  }

  return result;
}

function rest(input: string): string {
  return input.substring(1, input.length);
}

function concat<T>(target: Array<T>, input: Array<T>): Array<T> {
  return target.concat(input);
}

function expand(query: string): Array<string> {
  const [from, to] = query.split("..");

  if (!from || !to || from.length !== to.length) {
    return [query];
  }

  function generate(from: string, to: string): Array<string> {
    if (from.length === 0 && to.length === 0) {
      return [""];
    }

    return generate(rest(from), rest(to))
      .map((result) => {
        return range(from, to).map((c) => c + result);
      })
      .reduce(concat, []);
  }

  return generate(from, to).sort();
}

function parseRecords(input: string): Array<Record> {
  return input.split(/\n+%%\n+/).map((record) =>
    record
      .replace(/\n\s+/g, " ")
      .split(/\n+/)
      .map((field) => {
        const separator = field.indexOf(":");
        return {
          name: field.substring(0, separator).trim(),
          value: field.substring(separator + 1).trim(),
        };
      }),
  );
}

axios.get(registry).then(({ data }) => {
  const records = parseRecords(data);

  const subtags: Array<Subtag> = [];

  for (const record of records) {
    const tag = record.find(
      (field) => field.name === "Tag" || field.name === "Subtag",
    );

    const type = record.find((field) => field.name === "Type");

    if (tag === undefined || type === undefined) {
      continue;
    }

    const prefixes = record.filter((field) => field.name === "Prefix");
    const scope = record.find((field) => field.name === "Scope");

    for (const name of expand(tag.value)) {
      const args: Args = {};

      switch (type.value) {
        case "language":
          args.scope = scope === undefined ? null : scope.value;
          break;

        case "extlang":
          args.prefix = prefixes[0].value;
          break;

        case "variant":
          args.prefixes = prefixes.map((prefix) => prefix.value);
      }

      const subtag: Subtag = {
        type: type.value,
        name: name.toLowerCase(),
        args,
      };

      if (getType(subtag) !== null) {
        subtags.push(subtag);
      }
    }
  }

  const groups: Map<string, Array<Subtag>> = subtags.reduce(
    (groups, subtag) => {
      const group = getType(subtag);

      let subtags = groups.get(group);

      if (subtags === undefined) {
        subtags = [];
        groups.set(group, subtags);
      }

      subtags.push(subtag);

      return groups;
    },
    new Map(),
  );

  const code = `
// This file has been automatically generated based on the IANA Language Subtag
// Registry. Do therefore not modify it directly! If you wish to make changes,
// do so in \`scripts/languages.js\` and run \`yarn generate\` to rebuild this file.

/**
 * @internal
 */
export type Languages = typeof Languages;

/**
 * @internal
 */
export const Languages = {
  ${[...groups]
    .map(
      ([group, subtags]) => `
        ${group}: {
          ${subtags
            .map((subtag) => `"${subtag.name}": ${JSON.stringify(subtag.args)}`)
            .join(",\n")}
        }
      `,
    )
    .join(",\n")}
} as const;
  `;

  prettier
    .format(code, {
      parser: "typescript",
    })
    .then((code) =>
      fs.writeFileSync(
        path.join(import.meta.dirname, "../src/language/data.ts"),
        code,
      ),
    );
});
