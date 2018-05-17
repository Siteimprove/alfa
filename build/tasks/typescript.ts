import { write } from "@foreman/fs";
import { extension } from "@foreman/path";
import { notify } from "@foreman/notify";
import * as typescript from "@foreman/typescript";

const workspace = new typescript.Workspace();

export async function diagnose(path: string): Promise<void> {
  const diagnotics = await typescript.diagnose(workspace, path);

  if (diagnotics.length === 0) {
    notify({
      message: "Typecheck succeeded",
      type: "success"
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

export async function compile(path: string): Promise<void> {
  try {
    const files = await typescript.compile(workspace, path);

    for (const { name, text } of files) {
      await write(name, text);
    }

    notify({
      message: "Compilation succeeded",
      type: "success"
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
