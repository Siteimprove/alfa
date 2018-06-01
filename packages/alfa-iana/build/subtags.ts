import { write } from "@foreman/fs";
import * as prettier from "@foreman/prettier";
import * as got from "got";
import { Subtag } from "../src/types";
const stringify = require("stringify-object");
const RecordJar = require("record-jar");

const { assign } = Object;

const Registry = "https://www.iana.org/assignments/language-subtag-registry";

function type(subtag: Subtag): string | null {
  switch (subtag.type) {
    case "language":
      return "PrimaryLanguage";
    case "extlang":
      return "ExtendedLanguage";
    case "script":
      return "Script";
    case "region":
      return "Region";
    case "variant":
      return "Variant";
    default:
      return null;
  }
}

function name(subtag: Subtag): string {
  return subtag.name.toUpperCase().replace(/^(\d)/, "_$1");
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
      .map(result => {
        return range(from, to).map(c => c + result);
      })
      .reduce(concat, []);
  }

  return generate(from, to).sort();
}

async function subtags() {
  const { body } = await got(Registry);
  const { records } = new RecordJar(body);

  const subtags: Array<Subtag> = [];

  for (const record of records) {
    const { Type, Subtag, Tag, Prefix, Scope } = record;

    if (Subtag || Tag) {
      for (const name of expand(Subtag || Tag)) {
        const subtag = assign(
          {
            type: Type,
            name: name.toLowerCase()
          },
          Prefix
            ? {
                prefix:
                  typeof Prefix === "string"
                    ? Prefix.toLowerCase()
                    : Prefix.map(prefix => prefix.toLowerCase())
              }
            : {},
          Scope ? { scope: Scope } : {}
        );

        if (type(subtag) !== null) {
          subtags.push(subtag);
        }
      }
    }
  }

  const groups = subtags.reduce<Map<string, Array<Subtag>>>(
    (groups, subtag) => {
      const group = type(subtag) + "s";

      let subtags = groups.get(group);

      if (subtags === undefined) {
        subtags = [];
        groups.set(group, subtags);
      }

      subtags.push(subtag);

      return groups;
    },
    new Map()
  );

  const lines = [
    `
    // This file has been automatically generated based on the IANA Language Subtag
    // Registry. Do therefore not modify it directly! If you wish to make changes,
    // do so in \`build/subtags.ts\` and run \`yarn prepare\` to rebuild this file.

    import { values } from "@siteimprove/alfa-util";
    import { PrimaryLanguage, ExtendedLanguage, Script, Region, Variant } from "./types";
    `
  ];

  for (const [group, subtags] of groups) {
    lines.push(`
      export namespace ${group} {
        ${subtags
          .map(subtag => {
            return `export const ${name(subtag)}: ${type(subtag)} = ${stringify(
              subtag
            )}`;
          })
          .join("\n\n")}
      }
    `);

    const index = group.substring(0, group.length - 1);

    lines.push(`
      export const ${index}Index: Map<string, ${index}> = new Map();

      for (const subtag of values(${group})) {
        ${index}Index.set(subtag.name, subtag);
      }
    `);
  }

  const { code } = prettier.transform(lines.join("\n\n"), {
    parser: "typescript"
  });

  await write("src/subtags.ts", code);
}

subtags();
