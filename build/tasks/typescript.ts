import { read, write } from "@foreman/fs";
import { extension } from "@foreman/path";
import { notify } from "@foreman/notify";
import * as typescript from "@foreman/typescript";

const service = typescript.createLanguageService();

export async function check(path: string): Promise<void> {
  const source = await read(path);
  const diagnotics = await typescript.diagnose(service, path);

  if (diagnotics.length === 0) {
    notify({
      message: "Typecheck succeeded",
      type: "success",
      desktop: false
    });
  } else {
    const [error] = diagnotics;

    notify({
      message: "Typecheck failed",
      type: "error",
      error
    });

    throw error;
  }
}

export async function transform(path: string): Promise<void> {
  const source = await read(path);
  try {
    const { code } = typescript.transform(source, {
      fileName: path
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
