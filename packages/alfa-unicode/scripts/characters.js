const fs = require("fs");
const prettier = require("prettier");

const { fetch } = require("../../../scripts/helpers/http");
const { build } = require("../../../scripts/tasks/build");

const { isArray } = Array;

/**
 * @typedef {{ name: string, code: number | [number, number], category: string }} Character
 */

/**
 * @see http://www.unicode.org/reports/tr44/#UnicodeData.txt
 */
const database = "https://www.unicode.org/Public/11.0.0/ucd/UnicodeData.txt";

/**
 * @see http://www.unicode.org/reports/tr44/#Code_Point_Ranges
 */
const range = /<([\w\s]+),\s*(First|Last)>/;

fetch(database).then(body => {
  const entries = body.split("\n").filter(entry => entry.trim() !== "");

  /**
   * @type {Array<Character>}
   */
  const characters = entries
    .map(entry => {
      const properties = entry.split(";");

      const code = parseInt(properties[0], 16);
      const name = properties[1];
      const category = properties[2];

      return {
        name,
        code,
        category
      };
    })
    .reduce(
      (characters, character) => {
        const match = character.name.match(range);

        if (match !== null) {
          const name = match[1];
          const part = match[2];

          if (part === "Last") {
            const last = characters[characters.length - 1];

            last.code = [/** @type {number} */ (last.code), character.code];

            return characters;
          } else {
            character.name = name;
          }
        }

        characters.push(character);

        return characters;
      },
      /** @type {Array<Character>} */ ([])
    );

  let code = `
// This file has been automatically generated based on the Unicode Character
// Database. Do therefore not modify it directly! If you wish to make changes,
// do so in \`scripts/characters.js\` and run \`yarn prepare\` to rebuild this file.

import { Category, Character } from "./types";

export const Characters: Array<Character> = [
  ${characters
    .map(character => {
      const { name, code, category } = character;
      return `{
        name: "${name}",
        code: ${isArray(code) ? `[${code.join(", ")}]` : code},
        category: Category.${category}
      }`;
    })
    .join(",")}
];
  `;

  code = prettier.format(code, {
    parser: "typescript"
  });

  const file = `${__dirname}/../src/characters.ts`;
  fs.writeFileSync(file, code);
  build(file);
  fs.unlinkSync(file);
});
