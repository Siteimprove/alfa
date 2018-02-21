import { base, extension } from "@foreman/path";
import { read, write } from "@foreman/fs";
import { notify } from "@foreman/notify";
const { parse } = require("hjson");
const stringify = require("stringify-object");

export async function transform(path: string) {
  try {
    const hjson = await read(path);
    const json = parse(hjson);
    const string = stringify(json, { indent: "  " });

    const code = `
// This file has been automatically generated from ${base(path)}.
import { Locale } from '@alfa/rule'

const locale: Locale = ${string}

export default locale
    `.trim();

    await write(extension(path, ".ts"), code + "\n");

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
