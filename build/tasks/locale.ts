import { base, extension } from "@foreman/path";
import { read, write } from "@foreman/fs";
import { notify } from "@foreman/notify";
import * as prettier from "@foreman/prettier";
const { parse } = require("hjson");
const stringify = require("stringify-object");

export async function transform(path: string) {
  try {
    const hjson = await read(path);
    const json = parse(hjson);
    const string = stringify(json, { indent: "  " });

    const { code } = prettier.transform(
      `
      import { Locale } from "@siteimprove/alfa-act";

      export const ${json.id.toUpperCase()}: Locale = ${string};
      `,
      {
        parser: "typescript"
      }
    );

    await write(extension(path, ".ts"), code);

    notify({
      message: "Compilation succeeded",
      type: "compile",
      desktop: false
    });
  } catch (error) {
    notify({
      message: "Compilation failed",
      type: "error",
      error
    });

    throw error;
  }
}
