const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const axios = require("axios");

const registry = "https://www.iana.org/assignments/language-subtag-registry";

/**
 * @typedef {{ name: string, value: string }} Field
 */

/**
 * @typedef {Array<Field>} Record
 */

/**
 * @typedef {object} Subtag
 * @property {string} type
 * @property {string} name
 * @property {Array<string>} args
 */

/**
 * @param {Subtag} subtag
 * @return {string | null}
 */
function getType(subtag) {
  switch (subtag.type) {
    case "language":
      return "Primary";
    case "extlang":
      return "Extended";
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
      .map((result) => {
        return range(from, to).map((c) => c + result);
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
      })
  );
}

axios.get(registry).then(({ data }) => {
  const records = parseRecords(data);

  /** @type {Array<Subtag>} */
  const subtags = [];

  for (const record of records) {
    const tag = record.find(
      (field) => field.name === "Tag" || field.name === "Subtag"
    );

    const type = record.find((field) => field.name === "Type");

    if (tag === undefined || type === undefined) {
      continue;
    }

    const prefixes = record.filter((field) => field.name === "Prefix");
    const scope = record.find((field) => field.name === "Scope");

    for (const name of expand(tag.value)) {
      /** @type {Array<string>} */
      const args = [`"${name.toLowerCase()}"`];

      switch (type.value) {
        case "language":
          if (scope !== undefined) {
            args.push(`Option.of("${scope.value}")`);
          }
          break;

        case "extlang":
          args.push(`"${prefixes[0].value}"`);

          if (scope !== undefined) {
            args.push(`Option.of("${scope.value}")`);
          }
          break;

        case "variant":
          args.push(`[${prefixes.map((prefix) => `"${prefix.value}"`)}]`);
      }

      /** @type {Subtag} */
      const subtag = {
        type: type.value,
        name: name.toLowerCase(),
        args,
      };

      if (getType(subtag) !== null) {
        subtags.push(subtag);
      }
    }
  }

  /** @type {Map<string, Array<Subtag>>} */
  const groups = subtags.reduce((groups, subtag) => {
    const group = getType(subtag);

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
    // do so in \`scripts/subtags.js\` and run \`yarn generate\` to rebuild this file.

    import { Map } from "@siteimprove/alfa-map";
    import { Option } from "@siteimprove/alfa-option";

    import { Language } from "../language";
    `,
  ];

  for (const [group, subtags] of groups) {
    lines.push(`
      export const ${group} = Map.from([
        ${subtags
          .map((subtag) => {
            const type = getType(subtag);

            return `["${subtag.name}", Language.${type}.of(${subtag.args.join(
              ", "
            )})]`;
          })
          .join("\n,")}
      ])
    `);
  }

  const code = prettier.format(lines.join("\n\n"), {
    parser: "typescript",
  });

  fs.writeFileSync(path.join(__dirname, "../src/language/subtags.ts"), code);
});
