// @ts-check

const prettier = require("prettier");
const got = require("got");
const stringify = require("stringify-object");
const RecordJar = require("record-jar");

const { writeFile } = require("../../../build/helpers/file-system");

const registry = "https://www.iana.org/assignments/language-subtag-registry";

function type(subtag) {
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

function name(subtag) {
  return subtag.name.toUpperCase().replace(/^(\d)/, "_$1");
}

function range(from, to) {
  const start = from.charCodeAt(0);
  const end = to.charCodeAt(0);

  /** @type {Array<string>} */
  const result = [];

  for (let i = start; i <= end; i++) {
    result.push(String.fromCharCode(i));
  }

  return result;
}

function rest(input) {
  return input.substring(1, input.length);
}

function concat(target, input) {
  return target.concat(input);
}

function expand(query) {
  const [from, to] = query.split("..");

  if (!from || !to || from.length !== to.length) {
    return [query];
  }

  function generate(from, to) {
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

got(registry).then(response => {
  const { records } = new RecordJar(response.body);

  const subtags = [];

  for (const record of records) {
    const { Type, Subtag, Tag, Prefix, Scope } = record;

    if (Subtag || Tag) {
      for (const name of expand(Subtag || Tag)) {
        const subtag = Object.assign(
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

  const groups = subtags.reduce((groups, subtag) => {
    const group = type(subtag) + "s";

    let subtags = groups.get(group);

    if (subtags === undefined) {
      subtags = [];
      groups.set(group, subtags);
    }

    subtags.push(subtag);

    return groups;
  }, new Map());

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

  const code = prettier.format(lines.join("\n\n"), {
    parser: "typescript"
  });

  writeFile("src/subtags.ts", code);
});
