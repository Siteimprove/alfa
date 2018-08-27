const fs = require("fs");
const prettier = require("prettier");

const { fetch } = require("../../../build/helpers/http");

const registry = "https://www.iana.org/assignments/language-subtag-registry";

/**
 * @typedef {{ name: string, value: string }} Field
 */

/**
 * @typedef {Array<Field>} Record
 */

/**
 * @typedef {Object} Subtag
 * @property {string} name
 * @property {string} type
 * @property {string | Array<string>} [prefix]
 * @property {string} [scope]
 */

/**
 * @param {Subtag} subtag
 * @return {string | null}
 */
function getType(subtag) {
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
  }

  return null;
}

/**
 * @param {Subtag} subtag
 * @return {string | null}
 */
function getName(subtag) {
  return subtag.name.toUpperCase().replace(/^(\d)/, "_$1");
}

/**
 * @param {string} from
 * @param {string} to
 * @return {Array<string>}
 */
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

/**
 * @param {string} input
 * @return {string}
 */
function rest(input) {
  return input.substring(1, input.length);
}

/**
 * @template T
 * @param {Array<T>} target
 * @param {Array<T>} input
 * @return {Array<T>}
 */
function concat(target, input) {
  return target.concat(input);
}

/**
 * @param {string} query
 * @return {Array<string>}
 */
function expand(query) {
  const [from, to] = query.split("..");

  if (!from || !to || from.length !== to.length) {
    return [query];
  }

  /**
   * @param {string} from
   * @param {string} to
   * @return {Array<string>}
   */
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

/**
 * @param {string} input
 * @return {Array<Record>}
 */
function parseRecords(input) {
  return input.split(/\n+%%\n+/).map(record =>
    record
      .replace(/\n\s+/g, " ")
      .split(/\n+/)
      .map(field => {
        const separator = field.indexOf(":");
        return {
          name: field.substring(0, separator).trim(),
          value: field.substring(separator + 1).trim()
        };
      })
  );
}

fetch(registry).then(body => {
  const records = parseRecords(body);

  /** @type {Array<Subtag>} */
  const subtags = [];

  for (const record of records) {
    const tag = record.find(
      field => field.name === "Tag" || field.name === "Subtag"
    );

    const type = record.find(field => field.name === "Type");

    if (tag === undefined || type === undefined) {
      continue;
    }

    const prefix = record.filter(field => field.name === "Prefix");
    const scope = record.find(field => field.name === "Scope");

    for (const name of expand(tag.value)) {
      /** @type {Subtag} */
      const subtag = Object.assign(
        {
          type: type.value,
          name: name.toLowerCase()
        },
        prefix.length > 0
          ? {
              prefix:
                prefix.length > 1
                  ? prefix.map(prefix => prefix.value.toLowerCase())
                  : prefix[0].value.toLowerCase()
            }
          : {},
        scope !== undefined ? { scope: scope.value } : {}
      );

      if (getType(subtag) !== null) {
        subtags.push(subtag);
      }
    }
  }

  /** @type {Map<string, Array<Subtag>>} */
  const groups = subtags.reduce((groups, subtag) => {
    const group = getType(subtag) + "s";

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
    // do so in \`build/subtags.js\` and run \`yarn prepare\` to rebuild this file.

    import { values } from "@siteimprove/alfa-util";
    import { ExtendedLanguage, PrimaryLanguage, Region, Script, Variant } from "./types";
    `
  ];

  for (const [group, subtags] of groups) {
    lines.push(`
      export namespace ${group} {
        ${subtags
          .map(subtag => {
            const value = JSON.stringify(subtag, null, 2);
            return `export const ${getName(subtag)}: ${getType(
              subtag
            )} = ${value}`;
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

  fs.writeFileSync("src/subtags.ts", code);
});
