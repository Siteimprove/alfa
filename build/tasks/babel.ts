import { read, write } from "@foreman/fs";
import { extension } from "@foreman/path";
import { notify } from "@foreman/notify";
import * as babel from "@foreman/babel";
import * as config from "../config";

export async function transform(path: string): Promise<void> {
  const source = await read(path);
  try {
    const code = await babel.transform(source, {
      ...config.babel,
      filename: path
    });

    await write(extension(path.replace("/src/", "/dist/"), ".js"), code);

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
